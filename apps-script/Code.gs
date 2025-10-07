var RSVP_CONFIG = (function () {
  var props = PropertiesService.getScriptProperties();
  return {
    validInviteHashes: ['8512aaeb58c10e0e5f8254bb61bbe268'],
    hostEmails: ['egon.ferri@gmail.com'],
    sheetId: props.getProperty('RSVP_SHEET_ID') || '',
    sheetName: props.getProperty('RSVP_SHEET_NAME') || 'RSVP Responses',
    fromName: props.getProperty('RSVP_FROM_NAME') || 'RSVP Egon & Ele',
    timezone: props.getProperty('RSVP_TIMEZONE') || Session.getScriptTimeZone() || 'Europe/Rome'
  };
})();

var FOOD_LABELS = {
  omnivore: 'Onnivoro',
  vegan: 'Vegano',
  vegetarian: 'Vegetariano',
  celiac: 'Celiaco',
  'no dairy': 'Senza lattosio'
};

function doPost(e) {
  try {
    if (!e || !e.parameter) {
      return buildResponse('error', 'Richiesta non valida.');
    }

    var submission = normaliseSubmission(e.parameter);
    validateSubmission(submission);

    persistSubmission(submission);

    var summary = buildSummary(submission);
    notifyHosts(submission, summary);
    sendGuestConfirmation(submission, summary);

    return buildResponse('success', 'RSVP salvato con successo.');
  } catch (err) {
    console.error('RSVP error', err);
    return buildResponse('error', 'Si e verificato un problema con il salvataggio della tua risposta. Riprova piu tardi.');
  }
}

function normaliseSubmission(params) {
  function toStringValue(value) {
    return (value || '').toString().trim();
  }

  function toInteger(value) {
    var parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : Math.max(parsed, 0);
  }

  var now = new Date();
  return {
    yourName: toStringValue(params.your_name),
    yourFoodPref: toStringValue(params.your_food_pref),
    partnerName: toStringValue(params.partner_name),
    partnerFoodPref: toStringValue(params.partner_food_pref),
    numKids: toInteger(params.num_kids),
    kidsFoodPref: toStringValue(params.kids_food_pref),
    numTeens: toInteger(params.num_teens),
    teensFoodPref: toStringValue(params.teens_food_pref),
    email: toStringValue(params.email),
    inviteCode: toStringValue(params.invite_code),
    createdAt: now,
    createdAtFormatted: Utilities.formatDate(now, RSVP_CONFIG.timezone, 'yyyy-MM-dd HH:mm')
  };
}

function validateSubmission(submission) {
  if (!submission.yourName) {
    throw new Error('Your name is required');
  }

  if (!submission.email || !/^.+@.+\..+$/.test(submission.email)) {
    throw new Error('A valid email address is required');
  }

  if (!isInviteCodeValid(submission.inviteCode)) {
    throw new Error('Invalid invite code');
  }
}

function isInviteCodeValid(code) {
  if (!code) {
    return false;
  }

  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, code.trim());
  var hash = digestToHex(digest);
  return RSVP_CONFIG.validInviteHashes.indexOf(hash) !== -1;
}

function digestToHex(digest) {
  var output = [];
  for (var i = 0; i < digest.length; i++) {
    var value = digest[i];
    if (value < 0) {
      value += 256;
    }
    var hex = value.toString(16);
    if (hex.length === 1) {
      hex = '0' + hex;
    }
    output.push(hex);
  }
  return output.join('');
}

function persistSubmission(submission) {
  var spreadsheet;

  if (RSVP_CONFIG.sheetId) {
    spreadsheet = SpreadsheetApp.openById(RSVP_CONFIG.sheetId);
  } else {
    spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    if (!spreadsheet) {
      console.warn('No spreadsheet bound to the script; skipping sheet persistence');
      return;
    }
  }

  var sheet = spreadsheet.getSheetByName(RSVP_CONFIG.sheetName);

  if (!sheet) {
    sheet = spreadsheet.getActiveSheet();
  }

  if (!sheet) {
    sheet = spreadsheet.insertSheet(RSVP_CONFIG.sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp',
      'Nome',
      'Menu',
      'Partner',
      'Menu partner',
      'Bambini',
      'Menu bambini',
      'Ragazzi',
      'Menu ragazzi',
      'Email',
      'Codice invito'
    ]);
  }

  sheet.appendRow([
    submission.createdAtFormatted,
    submission.yourName,
    labelForFood(submission.yourFoodPref),
    submission.partnerName,
    labelForFood(submission.partnerFoodPref),
    submission.numKids,
    labelForFood(submission.kidsFoodPref),
    submission.numTeens,
    labelForFood(submission.teensFoodPref),
    submission.email,
    submission.inviteCode
  ]);
}

function labelForFood(value) {
  if (!value) {
    return 'Non specificato';
  }
  return FOOD_LABELS[value] || value;
}

function buildSummary(submission) {
  var rows = [];
  rows.push(['Nome', submission.yourName || '']);
  rows.push(['Email', submission.email || '']);
  rows.push(['Menu', labelForFood(submission.yourFoodPref)]);

  if (submission.partnerName) {
    rows.push(['Partner', submission.partnerName]);
    rows.push(['Menu partner', labelForFood(submission.partnerFoodPref)]);
  }

  if (submission.numKids > 0) {
    rows.push(['Bambini', submission.numKids.toString() + optionalMenuSuffix(submission.kidsFoodPref)]);
  }

  if (submission.numTeens > 0) {
    rows.push(['Ragazzi', submission.numTeens.toString() + optionalMenuSuffix(submission.teensFoodPref)]);
  }

  rows.push(['Totale invitati', totalGuests(submission).toString()]);
  rows.push(['Codice invito', submission.inviteCode || '']);
  rows.push(['Inviato', submission.createdAtFormatted]);

  return {
    rows: rows,
    htmlTable: rowsToHtml(rows),
    textSummary: rowsToText(rows)
  };
}

function optionalMenuSuffix(foodPref) {
  if (!foodPref) {
    return '';
  }
  return ' (' + labelForFood(foodPref) + ')';
}

function totalGuests(submission) {
  var total = 1; // main guest
  if (submission.partnerName) {
    total += 1;
  }
  total += submission.numKids;
  total += submission.numTeens;
  return total;
}

function rowsToHtml(rows) {
  var cells = rows.map(function (row) {
    return '<tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:bold;">' + escapeHtml(row[0]) + '</td><td style="padding:4px 8px;border:1px solid #ddd;">' + escapeHtml(row[1]) + '</td></tr>';
  }).join('');
  return '<table style="border-collapse:collapse;">' + cells + '</table>';
}

function rowsToText(rows) {
  return rows.map(function (row) {
    return row[0] + ': ' + row[1];
  }).join('\n');
}

function notifyHosts(submission, summary) {
  if (!RSVP_CONFIG.hostEmails || RSVP_CONFIG.hostEmails.length === 0) {
    return;
  }

  var subject = 'Nuovo RSVP: ' + submission.yourName;
  var htmlBody = '<p>Ciao!</p><p>Ecco i dettagli del nuovo RSVP ricevuto:</p>' +
    summary.htmlTable +
    '<p>Inviato il ' + escapeHtml(submission.createdAtFormatted) + '.</p>';
  var textBody = 'Nuovo RSVP ricevuto.\n\n' + summary.textSummary + '\n\nInviato il ' + submission.createdAtFormatted + '.';

  MailApp.sendEmail({
    to: RSVP_CONFIG.hostEmails.join(','),
    subject: subject,
    name: RSVP_CONFIG.fromName,
    body: textBody,
    htmlBody: htmlBody
  });
}

function sendGuestConfirmation(submission, summary) {
  if (!submission.email) {
    return;
  }

  var subject = 'Conferma RSVP - Egon & Ele';
  var greetingName = submission.yourName || 'ospite';
  var htmlBody = '<p>Ciao ' + escapeHtml(greetingName) + ',</p>' +
    '<p>grazie per aver confermato la tua presenza al nostro matrimonio!</p>' +
    '<p>Questo e il riepilogo della tua risposta:</p>' +
    summary.htmlTable +
    '<p>Ci vediamo sabato 27 giugno 2026: cerimonia alle 15:30 presso la Chiesa di Sant\'Egidio Abate a Monte Virginio e festa a Casacoco dalle 18:00.</p>' +
    '<p>Se devi aggiornare qualcosa, rispondi pure a questa email.</p>' +
    '<p>A presto,<br>Egon & Ele</p>';

  var textBody = 'Ciao ' + greetingName + ',\n\n' +
    'grazie per aver confermato la tua presenza al nostro matrimonio!\n\n' +
    'Riepilogo:\n' + summary.textSummary + '\n\n' +
    'Ci vediamo sabato 27 giugno 2026: cerimonia alle 15:30 presso la Chiesa di Sant\'Egidio Abate a Monte Virginio e festa a Casacoco dalle 18:00.\n\n' +
    'Se devi aggiornare qualcosa puoi rispondere a questa email.\n\n' +
    'A presto,\nEgon & Ele';

  MailApp.sendEmail({
    to: submission.email,
    subject: subject,
    name: RSVP_CONFIG.fromName,
    body: textBody,
    htmlBody: htmlBody
  });
}

function escapeHtml(value) {
  return (value || '').replace(/[&<>"']/g, function (char) {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case '\'':
        return '&#39;';
      default:
        return char;
    }
  });
}

function buildResponse(result, message) {
  var payload = {
    result: result,
    message: message
  };
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
