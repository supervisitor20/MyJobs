from myjobs.tests.setup import MyJobsBase
from myjobs.tests.test_views import TestClient
from myprofile.tests.factories import PrimaryNameFactory


global stubbed_data
fake_response = {
  "overview": {
    "full_name": "STRING",
    "email": "STRING",
    "profile_completion": 90
  },
  "summary": {
    "headline": "STRING",
    "the_summary": "STRING"
  },
  "name": [
    {
        "given_name": "STRING",
        "family_name": "STRING",
        "primary": True
    },
    {
        "given_name": "STRING",
        "family_name": "STRING",
        "primary": False
    },
  ],
  "employment_history": [
    {
        "position_title": "STRING",
        "organization_name": "STRING",
        "start_date": "STRING",
        "current_indicator": True,
        "end_date": "STRING",
        "city_name": "STRING",
        "country_sub_division_code": "STRING",
        "country_code": "STRING",
        "description": "STRING",
        "industry_code": "STRING",
        "job_category_code": "STRING",
        "onet_code": "STRING"
    },
    {
        "position_title": "STRING",
        "organization_name": "STRING",
        "start_date": "STRING",
        "current_indicator": False,
        "end_date": "STRING",
        "city_name": "STRING",
        "country_sub_division_code": "STRING",
        "country_code": "STRING",
        "description": "STRING",
        "industry_code": "STRING",
        "job_category_code": "STRING",
        "onet_code": "STRING"
    },
  ],
  "education": [
    {
        "organization_name": "STRING",
        "degree_date": "STRING",
        "city_name": "STRING",
        "country_sub_division_code": "STRING",
        "country_code": "STRING",
        "education_level_code": 1,
        "start_date": "STRING",
        "end_date": "STRING",
        "education_score": "STRING",
        "degree_name": "STRING",
        "degree_major": "STRING",
        "degree_minor": "STRING"
    },
    {
        "organization_name": "STRING",
        "degree_date": "STRING",
        "city_name": "STRING",
        "country_sub_division_code": "STRING",
        "country_code": "STRING",
        "education_level_code": 1,
        "start_date": "STRING",
        "end_date": "STRING",
        "education_score": "STRING",
        "degree_name": "STRING",
        "degree_major": "STRING",
        "degree_minor": "STRING"
    },
  ],
  "education_level_choices": [
    "Education Level",
    "High School",
    "Non-Degree Education",
    "Associate",
    "Bachelor",
    "Master",
    "Doctoral",
  ],
  "country_choices": [
    "Afghanistan",
    "Albania",
    "ETC",
  ],
  "military_service": [
    {
        "country_code": "STRING",
        "branch": "STRING",
        "department": "STRING",
        "division": "STRING",
        "expertise": "STRING",
        "service_start_date": "STRING",
        "service_end_date": "STRING",
        "start_rank": "STRING",
        "end_rank": "STRING",
        "campaign": "STRING",
        "honor": "STRING"
    },
    {
        "country_code": "STRING",
        "branch": "STRING",
        "department": "STRING",
        "division": "STRING",
        "expertise": "STRING",
        "service_start_date": "STRING",
        "service_end_date": "STRING",
        "start_rank": "STRING",
        "end_rank": "STRING",
        "campaign": "STRING",
        "honor": "STRING"
    },
  ],
  "volunteer_history": [
    {
        "position_title": "STRING",
        "organization_name": "STRING",
        "start_date": "STRING",
        "current_indicator": True,
        "end_date": "STRING",
        "city_name": "STRING",
        "country_sub_division_code": "STRING",
        "country_code": "STRING",
        "description": "STRING"
    },
    {
        "position_title": "STRING",
        "organization_name": "STRING",
        "start_date": "STRING",
        "current_indicator": True,
        "end_date": "STRING",
        "city_name": "STRING",
        "country_sub_division_code": "STRING",
        "country_code": "STRING",
        "description": "STRING"
    },
  ],
  "license": [
    {
        "license_name": "STRING",
        "license_type": "STRING",
        "description": "STRING"
    },
    {
        "license_name": "STRING",
        "license_type": "STRING",
        "description": "STRING"
    },
  ],
  "secondary_email": [
    {
        "email": "STRING",
        "label": "STRING",
        "verified": True,
        "verified_date": "STRING"
    },
    {
        "email": "STRING",
        "label": "STRING",
        "verified": True,
        "verified_date": "STRING"
    },
  ],
  "website": [
    {
        "site_type_choices": [
            {
                "personal": "Personal"
            },
            {
                "portfolio": "Portfolio of my work"
            },
            {
                "created": "Site I created or helped create"
            },
            {
                "association": "Group or Association"
            },
            {
                "social": "Social media"
            },
            {
                "other": "Other"
            },
        ],
        "display_text": "STRING",
        "uri": "STRING",
        "uri_active": True,
        "description": "STRING",
        "site_type": "STRING"
    },
    {
        "site_type_choices": [
            {
                "personal": "Personal"
            },
            {
                "portfolio": "Portfolio of my work"
            },
            {
                "created": "Site I created or helped create"
            },
            {
                "association": "Group or Association"
            },
            {
                "social": "Social media"
            },
            {
                "other": "Other"
            },
        ],
        "display_text": "STRING",
        "uri": "STRING",
        "uri_active": True,
        "description": "STRING",
        "site_type": "STRING"
    },
  ],
  "address": [
    {
        "address_line_one": "STRING",
        "address_line_two": "STRING",
        "city_name": "STRING",
        "country_sub_division_code": "STRING",
        "country_code": "STRING",
        "postal_code": "STRING",
        "label": "STRING"
    },
    {
        "address_line_one": "STRING",
        "address_line_two": "STRING",
        "city_name": "STRING",
        "country_sub_division_code": "STRING",
        "country_code": "STRING",
        "postal_code": "STRING",
        "label": "STRING"
    },
  ],
  "telephone": [
      {
        "use_code_choices": [
          "----------",
          "Phone Type",
          "Home",
          "Work",
          "Mobile",
          "Pager",
          "Fax",
          "Other",
        ],
        "channel_code": "STRING",
        "country_dialing": "STRING",
        "area_dialing": "STRING",
        "number": "STRING",
        "extension": "STRING",
        "use_code": "STRING"
      },
      {
        "use_code_choices": [
          "----------",
          "Phone Type",
          "Home",
          "Work",
          "Mobile",
          "Pager",
          "Fax",
          "Other",
        ],
        "channel_code": "STRING",
        "country_dialing": "STRING",
        "area_dialing": "STRING",
        "number": "STRING",
        "extension": "STRING",
        "use_code": "STRING"
      },
  ],
}

class MyProfileAPITests(MyJobsBase):
    def setUp(self):
        super(MyProfileAPITests, self).setUp()
        self.client = TestClient()
        self.client.login_user(self.user)
        self.name = PrimaryNameFactory(user=self.user)

    def test_get_details_sections_exist(self):
        # Checking just a few sections...
        self.assertIsNotNone(fake_response['name'])
        self.assertIsNotNone(fake_response['name'][0]['given_name'])
        self.assertIsNotNone(fake_response['education'])
        self.assertIsNotNone(fake_response['education'][0]['education_level_code'])
        self.assertIsNotNone(fake_response['website'])

    def test_get_details_sections_correct_type(self):
        # Checking just a few sections...
        self.assertIsInstance(fake_response['name'], object)
        self.assertIsInstance(fake_response['name'][0]['given_name'], str)
        self.assertIsInstance(fake_response['education'], object)
        self.assertIsInstance(fake_response['education'][0]['education_level_code'], int)
        self.assertIsInstance(fake_response['website'][0]['uri_active'], bool)

    def test_delete_item_success(self):
        # Replace with actual REST interaction...
        output = {}
        output["success"] = True

        self.assertEqual(output["success"], True)

    def test_delete_item_failure(self):
        # Replace with actual REST interaction...
        output = {}
        output["success"] = False
        output["message"] = "Some message here"

        self.assertEqual(output["success"], False)
        self.assertEqual(output["message"], "Some message here")

    def test_handle_form_success(self):
        # Replace with actual REST interaction...
        output = {}
        output["success"] = True
        output["message"] = "Some message here"

        self.assertEqual(output["success"], True)
        self.assertEqual(output["message"], "Some message here")

    def test_handle_form_failure(self):
        # Replace with actual REST interaction...
        output = {}
        output["success"] = False
        output["message"] = "Some message here"

        self.assertEqual(output["success"], False)
        self.assertEqual(output["message"], "Some message here")
