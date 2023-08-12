const SLACK_VERIFICATION_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_VERIFICATION_TOKEN');
const SLACK_BOT_USER_OAUTH_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_USER_OAUTH_TOKEN');
const SLACK_USER_OAUTH_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_USER_OAUTH_TOKEN');
const SLACK_WEBHOOK_URL = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_URL');

const postTest = () => {
  const postUrl = 'https://slack.com/api/reminders.add'
  const viewData = {
    token: SLACK_USER_OAUTH_TOKEN,
    text: 'test',
    time: 'at 20:00 every Tuesday, Wednesday'
  }
  const viewDataPayload = JSON.stringify(viewData)
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': `Bearer ${SLACK_USER_OAUTH_TOKEN}` },
    payload: viewDataPayload
  }

  UrlFetchApp.fetch(postUrl, options)
}

const doPost = (e) => {
  const parameter = e.parameter

  try {
    if(parameter.payload) {
      const payload = JSON.parse(decodeURIComponent(parameter.payload))
      if (SLACK_VERIFICATION_TOKEN != payload.token) throw new Error(payload.token)

      const { message, time } = buildText(payload);
      const postUrl = 'https://slack.com/api/reminders.add'
      const postData = {
        token: SLACK_USER_OAUTH_TOKEN,
        text: message,
        time: time
      }
      const postDataPayload = JSON.stringify(postData)
      const options = {
        method: 'post',
        contentType: 'application/json',
        headers: { 'Authorization': `Bearer ${SLACK_USER_OAUTH_TOKEN}` },
        payload: postDataPayload
      }

      UrlFetchApp.fetch(postUrl, options)
      return ContentService.createTextOutput()
    } else {
      if (SLACK_VERIFICATION_TOKEN != parameter.token) throw new Error(parameter.token)
      return openModal(parameter)
    }
  } catch(error) {
    return ContentService.createTextOutput(403)
  }
}

const buildText = (payload) => {
  const values = payload.view.state.values;
  const message = values.message_block.message.value;
  const repetition = values.repetition_block.repetition.selected_option.value;
  const selectedDaysOfWeekOptions = values.days_of_week_block.days_of_week.selected_options;
  const daysOfWeek = selectedDaysOfWeekOptions.map(option => option.value);
  const selectedDate = values.date_block.date.selected_date;
  const selectedTime = values.time_block.time.selected_time;

  let time;

  if (repetition === 'none') {
    time = `at ${selectedDate} ${selectedTime}`
    return { message, time };
  }

  if (repetition === 'every') {
    time = `at ${selectedTime} ${repetition} ${daysOfWeek.join(', ')}`
    return { message, time };
  }

  time = `at ${selectedTime} ${repetition}`
  return { message, time };
};

const openModal = payload => {
  const modalView = buildModalView()
  const viewData = {
    token: SLACK_BOT_USER_OAUTH_TOKEN,
    trigger_id: payload.trigger_id,
    view: JSON.stringify(modalView)
  }
  const postUrl = 'https://slack.com/api/views.open'
  const viewDataPayload = JSON.stringify(viewData)
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': `Bearer ${SLACK_BOT_USER_OAUTH_TOKEN}` },
    payload: viewDataPayload
  }

  UrlFetchApp.fetch(postUrl, options)
  return ContentService.createTextOutput()
}

const buildModalView = () => {
  return {
    'type': 'modal',
    'title': {
      'type': 'plain_text',
      'text': 'Reminder作成',
      'emoji': true
    },
    'submit': {
      'type': 'plain_text',
      'text': '作成する',
      'emoji': true
    },
    'close': {
      'type': 'plain_text',
      'text': 'キャンセル',
      'emoji': true
    },
    'blocks': [
      {
        'type': 'input',
        'block_id': 'message_block',
        'element': {
          'type': 'plain_text_input',
          'action_id': 'message'
        },
        'label': {
          'type': 'plain_text',
          'text': 'リマインドする内容を入力してください',
          'emoji': true
        }
      },
      {
        'type': 'input',
        'block_id': 'repetition_block',
        'element': {
          'type': 'radio_buttons',
          'options': [
            {
              'text': {
                'type': 'plain_text',
                'text': '毎日',
                'emoji': true
              },
              'value': 'everyday'
            },
            {
              'text': {
                'type': 'plain_text',
                'text': '毎週',
                'emoji': true
              },
              'value': 'every'
            },
            {
              'text': {
                'type': 'plain_text',
                'text': '毎週平日',
                'emoji': true
              },
              'value': 'every weekday'
            },
            {
              'text': {
                'type': 'plain_text',
                'text': 'しない',
                'emoji': true
              },
              'value': 'none'
            }
          ],
          'action_id': 'repetition'
        },
        'label': {
          'type': 'plain_text',
          'text': '繰り返し',
          'emoji': true
        }
      },
      {
        'type': 'input',
        'block_id': 'days_of_week_block',
        'optional': true,
        'element': {
          'type': 'multi_static_select',
          'placeholder': {
            'type': 'plain_text',
            'text': 'Select options',
            'emoji': true
          },
          'options': [
            {
              'text': {
                'type': 'plain_text',
                'text': '日',
                'emoji': true
              },
              'value': 'Sunday'
            },
            {
              'text': {
                'type': 'plain_text',
                'text': '月',
                'emoji': true
              },
              'value': 'Monday'
            },
            {
              'text': {
                'type': 'plain_text',
                'text': '火',
                'emoji': true
              },
              'value': 'Tuesday'
            },
            {
              'text': {
                'type': 'plain_text',
                'text': '水',
                'emoji': true
              },
              'value': 'Wednesday'
            },
            {
              'text': {
                'type': 'plain_text',
                'text': '木',
                'emoji': true
              },
              'value': 'Thursday'
            },
            {
              'text': {
                'type': 'plain_text',
                'text': '金',
                'emoji': true
              },
              'value': 'Friday'
            },
            {
              'text': {
                'type': 'plain_text',
                'text': '土',
                'emoji': true
              },
              'value': 'Saturday'
            }
          ],
          'action_id': 'days_of_week'
        },
        'label': {
          'type': 'plain_text',
          'text': '曜日 (繰り返しが毎週の場合のみ設定されます)',
          'emoji': true
        }
      },
      {
        'type': 'input',
        'block_id': 'date_block',
        'optional': true,
        'element': {
          'type': 'datepicker',
          'initial_date': Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
          'placeholder': {
            'type': 'plain_text',
            'text': 'Select a date',
            'emoji': true
          },
          'action_id': 'date'
        },
        'label': {
          'type': 'plain_text',
          'text': '日付 (繰り返しの場合は設定内容は無視されます)',
          'emoji': true
        }
      },
      {
        'type': 'input',
        'block_id': 'time_block',
        'element': {
          'type': 'timepicker',
          'initial_time': '20:00',
          'placeholder': {
            'type': 'plain_text',
            'text': 'Select time',
            'emoji': true
          },
          'action_id': 'time'
        },
        'label': {
          'type': 'plain_text',
          'text': '時間',
          'emoji': true
        }
      },
    ]
  };
}
