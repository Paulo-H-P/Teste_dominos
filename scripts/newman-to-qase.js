#!/usr/bin/env node
/**
 * Envia resultados do Newman (Postman) para o Qase.io.
 * Uso: node scripts/newman-to-qase.js [caminho-newman-report.json]
 * Variáveis de ambiente: QASE_API_TOKEN (ou QASE_TOKEN), QASE_PROJECT_CODE (ex: DOMINOS)
 * Carrega .env da raiz do projeto quando existir.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const https = require('https');

const REPORT_PATH = process.argv[2] || path.join(__dirname, '..', 'newman-run-report.json');
const ROOT_DIR = path.join(__dirname, '..');
const HTML_REPORT_PATHS = [
  path.join(ROOT_DIR, 'newman-report', 'newman-report.html'),
  path.join(ROOT_DIR, 'newman-report', 'index.html'),
  path.join(ROOT_DIR, 'newman-report.html')
];
const QASE_TOKEN = process.env.QASE_API_TOKEN || process.env.QASE_TOKEN || '';
const QASE_PROJECT = process.env.QASE_PROJECT_CODE || 'DOMINOS';
const QASE_RUN_TITLE = process.env.QASE_RUN_TITLE_API || process.env.QASE_RUN_TITLE || 'API Tests (Newman)';

function request(options, body, contentType) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Token': QASE_TOKEN
    };
    if (contentType) headers['Content-Type'] = contentType;
    else headers['Content-Type'] = 'application/json';

    const req = https.request({
      hostname: 'api.qase.io',
      path: options.path,
      method: options.method || 'GET',
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(parsed);
          else reject(new Error(parsed.error || data || `HTTP ${res.statusCode}`));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(Buffer.isBuffer(body) ? body : (typeof body === 'string' ? body : JSON.stringify(body)));
    req.end();
  });
}

/** Faz upload de um arquivo (ex.: relatório HTML) e retorna o hash para anexar ao resultado. */
function uploadAttachment(filePath) {
  return new Promise((resolve) => {
    if (!fs.existsSync(filePath)) {
      resolve(null);
      return;
    }
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file[]', fs.createReadStream(filePath), {
      filename: path.basename(filePath),
      contentType: 'text/html'
    });
    const headers = {
      'Token': QASE_TOKEN,
      ...form.getHeaders()
    };
    const req = https.request({
      hostname: 'api.qase.io',
      path: `/v1/attachment/${QASE_PROJECT}`,
      method: 'POST',
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300 && parsed.result && parsed.result[0]) {
            resolve(parsed.result[0].hash);
          } else {
            console.warn('⚠️ Qase upload respondeu:', res.statusCode, data ? data.slice(0, 200) : '');
            resolve(null);
          }
        } catch (e) {
          console.warn('⚠️ Qase upload parse erro:', e.message);
          resolve(null);
        }
      });
    });
    req.on('error', (err) => {
      console.warn('⚠️ Qase upload request erro:', err.message);
      resolve(null);
    });
    form.pipe(req);
  });
}

function findHtmlReport() {
  for (const p of HTML_REPORT_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function createRun() {
  return request({
    method: 'POST',
    path: `/v1/run/${QASE_PROJECT}`
  }, {
    title: `${QASE_RUN_TITLE} - ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`,
    description: 'Testes de API executados via Newman (Postman).',
    is_autotest: true
  });
}

function sendResult(runId, result) {
  return request({
    method: 'POST',
    path: `/v1/result/${QASE_PROJECT}/${runId}`
  }, result);
}

function main() {
  if (!fs.existsSync(REPORT_PATH)) {
    console.warn('⚠️ Arquivo de report não encontrado:', REPORT_PATH);
    console.warn('   Execute Newman com: --reporters json --reporter-json-export newman-run-report.json');
    process.exit(0);
    return;
  }

  if (!QASE_TOKEN || QASE_TOKEN.length < 32) {
    console.warn('⚠️ QASE_API_TOKEN ou QASE_TOKEN não configurado. Resultados não serão enviados ao Qase.');
    process.exit(0);
    return;
  }

  let summary;
  try {
    summary = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
  } catch (e) {
    console.error('❌ Erro ao ler report:', e.message);
    process.exit(1);
  }

  const executions = summary.run && summary.run.executions;
  if (!Array.isArray(executions) || executions.length === 0) {
    console.warn('⚠️ Nenhuma execução encontrada no report.');
    process.exit(0);
    return;
  }

  (async () => {
    try {
      const runRes = await createRun();
      const runId = runRes.result && runRes.result.id;
      if (!runId) {
        console.error('❌ Falha ao criar run no Qase:', runRes);
        process.exit(1);
      }
      console.log('✅ Run Qase criado:', runId, `https://app.qase.io/run/${QASE_PROJECT}/dashboard/${runId}`);

      let reportHash = null;
      const htmlPath = findHtmlReport();
      if (htmlPath) {
        console.log('📎 Enviando relatório HTML para o Qase:', path.basename(htmlPath));
        reportHash = await uploadAttachment(htmlPath);
        if (reportHash) console.log('✅ Relatório HTML anexado (hash:', reportHash.slice(0, 12) + '...).');
        else console.warn('⚠️ Não foi possível anexar o relatório HTML (veja avisos acima).');
      } else {
        console.warn('⚠️ Relatório HTML não encontrado. Procurou em:', HTML_REPORT_PATHS.map(p => path.relative(ROOT_DIR, p)).join(', '));
      }

      let sent = 0;
      for (const exec of executions) {
        const name = exec.item && exec.item.name ? exec.item.name : (exec.request && exec.request.url ? exec.request.url : 'Request');
        const assertions = exec.assertions || [];
        const failed = assertions.some(a => a.error);
        const status = failed ? 'failed' : 'passed';
        const timeMs = (exec.response && exec.response.responseTime) ? Math.round(exec.response.responseTime) : undefined;
        let comment = '';
        if (failed) {
          const failedAssertions = assertions.filter(a => a.error).map(a => `${a.assertion}: ${(a.error && a.error.message) || a.error}`);
          comment = failedAssertions.slice(0, 5).join('\n');
        }
        const body = {
          status,
          case: { title: `[API] ${name}` },
          time_ms: timeMs,
          comment: comment || undefined,
          attachments: sent === 0 && reportHash ? [reportHash] : undefined
        };
        await sendResult(runId, body);
        sent++;
      }
      console.log(`✅ ${sent} resultado(s) enviado(s) ao Qase.`);
    } catch (err) {
      console.error('❌ Erro ao enviar ao Qase:', err.message);
      process.exit(1);
    }
  })();
}

main();
