import {mapValues} from 'lodash-compat';

const communicationTypes = [
  {display: 'Email', value: 'email'},
  {display: 'Phone', value: 'phone'},
  {display: 'Meeting or Event', value: 'meetingorevent'},
  {display: 'Job Followup', value: 'job'},
];

const states = [
  {display: 'Select a State', value: ''},
  {display: 'Alabama', value: 'AL'},
  {display: 'Alaska', value: 'AK'},
  {display: 'American Samoa', value: 'AS'},
  {display: 'Arizona', value: 'AZ'},
  {display: 'Arkansas', value: 'AR'},
  {display: 'Armed Forces Americas', value: 'AA'},
  {display: 'Armed Forces Others', value: 'AE'},
  {display: 'Armed Forces Pacific', value: 'AP'},
  {display: 'California', value: 'CA'},
  {display: 'Colorado', value: 'CO'},
  {display: 'Connecticut', value: 'CT'},
  {display: 'Delaware', value: 'DE'},
  {display: 'District Of Columbia', value: 'DC'},
  {display: 'Florida', value: 'FL'},
  {display: 'Georgia', value: 'GA'},
  {display: 'Guam', value: 'GU'},
  {display: 'Hawaii', value: 'HI'},
  {display: 'Idaho', value: 'ID'},
  {display: 'Illinois', value: 'IL'},
  {display: 'Indiana', value: 'IN'},
  {display: 'Iowa', value: 'IA'},
  {display: 'Kansas', value: 'KS'},
  {display: 'Kentucky', value: 'KY'},
  {display: 'Louisiana', value: 'LA'},
  {display: 'Maine', value: 'ME'},
  {display: 'Maryland', value: 'MD'},
  {display: 'Massachusetts', value: 'MA'},
  {display: 'Michigan', value: 'MI'},
  {display: 'Minnesota', value: 'MN'},
  {display: 'Mississippi', value: 'MS'},
  {display: 'Missouri', value: 'MO'},
  {display: 'Montana', value: 'MT'},
  {display: 'Nebraska', value: 'NE'},
  {display: 'Nevada', value: 'NV'},
  {display: 'New Hampshire', value: 'NH'},
  {display: 'New Jersey', value: 'NJ'},
  {display: 'New Mexico', value: 'NM'},
  {display: 'New York', value: 'NY'},
  {display: 'North Carolina', value: 'NC'},
  {display: 'North Dakota', value: 'ND'},
  {display: 'Northern Mariana Islands', value: 'MP'},
  {display: 'Ohio', value: 'OH'},
  {display: 'Oklahoma', value: 'OK'},
  {display: 'Oregon', value: 'OR'},
  {display: 'Pennsylvania', value: 'PA'},
  {display: 'Puerto Rico', value: 'PR'},
  {display: 'Rhode Island', value: 'RI'},
  {display: 'South Carolina', value: 'SC'},
  {display: 'South Dakota', value: 'SD'},
  {display: 'Tennessee', value: 'TN'},
  {display: 'Texas', value: 'TX'},
  {display: 'United States Minor Outlying Islands', value: 'UM'},
  {display: 'Utah', value: 'UT'},
  {display: 'Vermont', value: 'VT'},
  {display: 'Virginia', value: 'VA'},
  {display: 'Virgin Islands', value: 'VI'},
  {display: 'Washington', value: 'WA'},
  {display: 'West Virginia', value: 'WV'},
  {display: 'Wisconsin', value: 'WI'},
  {display: 'Wyoming', value: 'WY'},
];

export const partnerForm = {
  fields: {
    name: {
      title: 'CharField',
      required: true,
      label: 'Partner Organization',
      help_text: 'Name of the Organization',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: true,
        attrs: {
          autofocus: 'autofocus',
          placeholder: 'Partner Organization',
          id: 'id_partner-partnername',
          maxlength: '255',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 255,
    },
    data_source: {
      title: 'CharField',
      required: false,
      label: 'Source',
      help_text: 'Website, event, or other source where you found the ' +
        'partner',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          placeholder: 'Source',
          id: 'id_partner-partnersource',
          maxlength: '255',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 255,
    },
    uri: {
      title: 'URLField',
      required: false,
      label: 'URL',
      help_text: 'Full url. ie http://partnerorganization.org',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          placeholder: 'URL',
          id: 'id_partner-partnerurl',
          maxlength: '255',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 255,
    },
    tags: {
      title: 'CharField',
      required: false,
      label: 'Tags',
      help_text:
        'ie \'Disability\', \'veteran-outreach\', etc. ' +
        'Separate tags with a comma.',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          placeholder: 'Tags',
          id: 'p-tags',
          maxlength: '255',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 255,
    },
  },
  orderedFields: [
    'name',
    'data_source',
    'uri',
    'tags',
  ],
};

export const contactForm = {
  fields: {
    name: {
      title: 'CharField',
      required: true,
      label: 'Name',
      help_text: '',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: true,
        attrs: {
          autofocus: 'autofocus',
          placeholder: 'Full Name',
          id: 'id_contact-name',
          maxlength: '255',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 255,
    },
    email: {
      title: 'EmailField',
      required: false,
      label: 'Email',
      help_text: 'Contact\'s email address',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          placeholder: 'Email',
          id: 'id_contact-email',
          maxlength: '255',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 255,
    },
    phone: {
      title: 'CharField',
      required: false,
      label: 'Phone',
      help_text: 'ie (123) 456-7890',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          placeholder: 'Phone',
          id: 'id_contact-phone',
          maxlength: '30',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 30,
    },
    tags: {
      title: 'CharField',
      required: false,
      label: 'Tags',
      help_text:
        'ie \'Disability\', \'veteran-outreach\', etc. Separate ' +
        'tags with a comma.',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          autocomplete: 'off',
          id: 'p-tags',
          maxlength: '255',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 255,
    },
    address_line_one: {
      title: 'CharField',
      required: false,
      label: 'Address Line One',
      help_text: 'ie 123 Main St',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          placeholder: 'Address Line One',
          id: 'id_location-address_line_one',
          maxlength: '255',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 255,
    },
    address_line_two: {
      title: 'CharField',
      required: false,
      label: 'Address Line Two',
      help_text: 'ie Suite 100',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          placeholder: 'Address Line Two',
          id: 'id_location-address_line_two',
          maxlength: '255',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 255,
    },
    city: {
      title: 'CharField',
      required: false,
      label: 'City',
      help_text: 'ie Chicago, Washington, Dayton',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: true,
        attrs: {
          placeholder: 'City',
          id: 'id_location-city',
          maxlength: '255',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 255,
    },
    state: {
      title: 'ChoiceField',
      required: false,
      label: 'State',
      help_text: '',
      widget: {
        title: 'Select',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: true,
        attrs: {
        },
        choices: states,
        input_type: 'select',
      },
      choices: states,
    },
    postal_code: {
      title: 'CharField',
      required: false,
      label: 'Postal Code',
      help_text: 'ie 90210, 12345-7890',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          placeholder: 'Postal Code',
          id: 'id_location-postal_code',
          maxlength: '12',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 12,
    },
    label: {
      title: 'CharField',
      required: false,
      label: 'Address Name',
      help_text: 'ie Main Office, Corporate, Regional',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          placeholder: 'Address Name',
          id: 'id_location-label',
          maxlength: '60',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 60,
    },
    notes: {
      title: 'CharField',
      required: false,
      label: 'Notes',
      help_text: 'Any additional information you want to record',
      widget: {
        title: 'Textarea',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          rows: 5,
          placeholder: 'Notes About This Contact',
          cols: 24,
        },
        input_type: 'textarea',
      },
      min_length: null,
      max_length: null,
    },
  },
  orderedFields: [
    'name',
    'email',
    'phone',
    'tags',
    'address_line_one',
    'address_line_two',
    'city',
    'state',
    'postal_code',
    'label',
    'notes',
  ],
};

function readonlyField(field) {
  return {
    ...field,
    readonly: true,
  };
}

export const contactNotesOnlyForm = {
  ...contactForm,
  fields: mapValues(contactForm.fields, (f, key) =>
    key === 'notes' ? f : readonlyField(f)),
};

export const communicationRecordForm = {
  fields: {
    contact_type: {
      title: 'TypedChoiceField',
      required: true,
      label: 'Communication Type',
      help_text: '',
      widget: {
        title: 'Select',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: true,
        attrs: {
          autofocus: 'autofocus',
        },
        choices: communicationTypes,
        input_type: 'select',
      },
      choices: communicationTypes,
      coerce: 'to_python',
      empty_value: '',
    },
    contact_email: {
      title: 'CharField',
      required: false,
      label: 'Contact Email *',
      help_text: '',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          maxlength: '255',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 255,
    },
    contact_phone: {
      title: 'CharField',
      required: false,
      label: 'Contact Phone Number *',
      help_text: '',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          maxlength: '30',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 30,
    },
    location: {
      title: 'CharField',
      required: false,
      label: 'Meeting Location *',
      help_text: '',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          maxlength: '255',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 255,
    },
    length: {
      label: 'Length',
      widget: {
        input_type: 'text',
        attrs: {},
      },
    },
    subject: {
      title: 'CharField',
      required: false,
      label: 'Subject or Topic',
      help_text: '',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          maxlength: '255',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 255,
    },
    date_time: {
      label: 'Date & Time',
      required: true,
      widget: {
        input_type: 'text',
        is_required: true,
        attrs: {},
      },
    },
    job_id: {
      title: 'CharField',
      required: false,
      label: 'Job Number/ID *',
      help_text: '',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          maxlength: '40',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 40,
    },
    job_applications: {
      title: 'CharField',
      required: false,
      label: 'Number of Applications',
      help_text: '',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          maxlength: '6',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 6,
    },
    job_interviews: {
      title: 'CharField',
      required: false,
      label: 'Number of Interviews',
      help_text: '',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          maxlength: '6',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 6,
    },
    job_hires: {
      title: 'CharField',
      required: false,
      label: 'Number of Hires',
      help_text: '',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          maxlength: '6',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 6,
    },
    tags: {
      title: 'CharField',
      required: false,
      label: 'Tags',
      help_text:
        'ie \'Disability\', \'veteran-outreach\', etc. Separate tags with ' +
        'a comma.',
      widget: {
        title: 'TextInput',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          autocomplete: 'off',
          id: 'p-tags',
          maxlength: '255',
        },
        input_type: 'text',
      },
      min_length: null,
      max_length: 255,
    },
    notes: {
      title: 'CharField',
      required: false,
      label: 'Details, Notes or Transcripts',
      help_text: '',
      widget: {
        title: 'Textarea',
        is_hidden: false,
        needs_multipart_form: false,
        is_localized: false,
        is_required: false,
        attrs: {
          rows: '10',
          cols: '40',
        },
        input_type: 'textarea',
      },
      min_length: null,
      max_length: null,
    },
  },
  orderedFields: [
    'contact_type',
    'contact_email',
    'contact_phone',
    'location',
    'length',
    'date_time',
    'subject',
    'job_id',
    'job_applications',
    'job_interviews',
    'job_hires',
    'tags',
    'notes',
  ],
};