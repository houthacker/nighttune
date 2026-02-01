# Nighttune Privacy Policy

This privacy policy is applicable to the `Nighttune` website (hereinafter referred to as "Application") for browser-capable devices, which was developed by [houthacker](https://github.com/houthacker) (hereinafter referred to as "Service Provider") as a an Open Source service. This service is provided "AS IS".

<!-- markdownlint-disable MD033 -->
<u>This privacy policy is effective as of **2026-07-01**</u>

## What information does the Application obtain and how is it used?

### What information do users provide to the Application?

The Application acquires the information you supply when you use the Application. Nighttune will only contact you to send your autotune report,
if you provide an email address. will only be used to send you your autotune report.

Important information and notices are sent through the `#general` Discord channel listed in [README.md](./README.md#discord).

### What information does the Application collect?

The Application collects certain information. This information is limited to the tables below. Information
that is not retained is used only when executing the Application and discarded immediately afterwards.

#### Your personal data

| Data element              | Retained  | Use                                   |
|---------------------------|-----------|---------------------------------------|
| Nightscout URL            |&#x2713;   | Retrieving profile and treatments     |
| Nightscout Access Token   |&#x274C;   | Accessing the Nightscout instance     |
| User email address        |&#x2713;   | Sending the autotune report           |
| Nightscout profiles       |&#x2713;   | Running autotune, showing reports     |
| Nightscout treatments     |&#x2713;   | Running autotune, showing reports     |
| Autotune recommendations  |&#x2713;   | Running autotune, showing reports     |
|                           |           |                                       |

#### Data not relateable to you

The table below contains data elements collected for performance monitoring and
debugging and is not relateable to you. **Therefore, this data cannot be retrieved nor deleted using a GDPR request.**
The retention periods shown in this table may change without notice.

| Data elements                                 | Retention period  | Use                                |
|-----------------------------------------------|-------------------|------------------------------------|
| Meta data about requests to Nighttune backend |2 months           | Performance monitoring, debugging  |
| Application logging                           |6 months           | Performance monitoring, debugging  |
| Metrics                                       |12 months          | Performance monitoring, debugging  |

Below are some examples of the data that is retained for monitoring and debugging purposes. These examples
not need to be complete and only serve to provide an impression of what it looks like.

<details>
<summary>Captcha challenge example</summary>

```json
{
 "resourceSpans": [
  {
   "resource": {
    "attributes": [
     {
      "key": "deployment.environment",
      "value": {
       "stringValue": "development"
      }
     },
     {
      "key": "service.name",
      "value": {
       "stringValue": "nighttune-frontend"
      }
     }
    ],
    "droppedAttributesCount": 0
   },
   "scopeSpans": [
    {
     "scope": {
      "name": "@opentelemetry/instrumentation-fetch",
      "version": "0.211.0"
     },
     "spans": [
      {
       "attributes": [
        {
         "key": "component",
         "value": {
          "stringValue": "fetch"
         }
        },
        {
         "key": "http.method",
         "value": {
          "stringValue": "POST"
         }
        },
        {
         "key": "http.url",
         "value": {
          "stringValue": "https://captcha.nighttune.app/abcdef0123/challenge"
         }
        },
        {
         "key": "http.status_code",
         "value": {
          "intValue": 200
         }
        },
        {
         "key": "http.status_text",
         "value": {
          "stringValue": "OK"
         }
        },
        {
         "key": "http.host",
         "value": {
          "stringValue": "captcha.nighttune.app"
         }
        },
        {
         "key": "http.scheme",
         "value": {
          "stringValue": "https"
         }
        },
        {
         "key": "http.user_agent",
         "value": {
          "stringValue": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0"
         }
        },
        {
         "key": "http.response_content_length",
         "value": {
          "intValue": 120
         }
        }
       ],
       "droppedAttributesCount": 0,
       "droppedEventsCount": 0,
       "droppedLinksCount": 0,
       "endTimeUnixNano": "1769769401712000000",
       "events": [
        {
         "attributes": [],
         "droppedAttributesCount": 0,
         "name": "fetchStart",
         "timeUnixNano": "1769769401612000000"
        },
        {
         "attributes": [],
         "droppedAttributesCount": 0,
         "name": "responseEnd",
         "timeUnixNano": "1769769401685000000"
        }
       ],
       "flags": 257,
       "kind": 3,
       "links": [],
       "name": "HTTP POST",
       "spanId": "2d4e7b9e84fb6b26",
       "startTimeUnixNano": "1769769401612000000",
       "status": {
        "code": 0
       },
       "traceId": "94a9e0d12877266af7c81c455070a7ae"
      }
     ]
    }
   ]
  }
 ]
}
```

</details>

<details>
<summary>Application log example</summary>

```json
{
 "resourceLogs": [
  {
   "resource": {
    "attributes": [
     {
      "key": "deployment.environment",
      "value": {
       "stringValue": "development"
      }
     },
     {
      "key": "service.name",
      "value": {
       "stringValue": "nighttune-frontend"
      }
     }
    ],
    "droppedAttributesCount": 0
   },
   "scopeLogs": [
    {
     "logRecords": [
      {
       "attributes": [],
       "body": {
        "stringValue": "Retrieving migrations from 1.5.0 to 2.2.0-dev.0"
       },
       "droppedAttributesCount": 0,
       "observedTimeUnixNano": "1769769402648000000",
       "severityNumber": 5,
       "severityText": "DEBUG",
       "timeUnixNano": "1769769402648000000"
      }
     ],
     "scope": {
      "name": "frontend-logger"
     }
    }
   ]
  }
 ]
}
```

</details>

<details>
<summary>Backend logging example</summary>

```json
{
  "body": "[https://my.nightscout.host] Autotune successful.",
  "date": "2026-02-01T15:07:18.885Z",
  "id": "0jPzj8ZkwvV9nU8oDPLqNu7lUeu",
  "timestamp": "2026-02-01T15:07:18.885Z",
  "attributes": {
    "span_id": "e1a8f3be2a9f79d5",
    "timestamp": "2026-02-01 16:07:18 +01:00",
    "trace_flags": "01",
    "trace_id": "7d2b248ec58b093c4ebf3a4b297982c3"
  },
  "resources": {
    "host.arch": "amd64",
    "host.id": "39312AD0-E362-5538-9BC7-65508ECD5268",
    "host.name": "nighttune.app",
    "os.type": "linux",
    "os.version": "6.8.0-90-generic",
    "process.command": "/app/main.js",
    "process.command_args": "[\"/.nvm/versions/node/v25.2.1/bin/node\",\"/app/main.js\"]",
    "process.executable.name": "/.nvm/versions/node/v25.2.1/bin/node",
    "process.executable.path": "/.nvm/versions/node/v25.2.1/bin/node",
    "process.owner": "nighttune",
    "process.pid": "68089",
    "process.runtime.description": "Node.js",
    "process.runtime.name": "nodejs",
    "process.runtime.version": "25.2.1",
    "service.instance.id": "121d696b-ebf3-474b-8366-b4b1dcd7a311",
    "service.name": "nighttune-backend"
  },
  "scope": {},
  "severity_text": "debug",
  "severity_number": 5,
  "scope_name": "@opentelemetry/winston-transport",
  "scope_version": "0.21.0",
  "span_id": "e1a8f3be2a9f79d5",
  "trace_flags": 1,
  "trace_id": "7d2b248ec58b093c4ebf3a4b297982c3"
}
```

</details>

#### Database schema

For those wanting to know the technical details of the retained data, the Nighttune database schema is located at <https://github.com/houthacker/nighttune-backend/blob/main/src/config/db.sql>.

### Does the Application collect precise real time location information?

No.

### Does the Application use Artificial Intelligence (AI) technologies?

No.

### Do third parties see and/or have access to information obtained by the Application?

No.

## What are my rights?

Under the GDPR there are [a number of rights](https://www.edpb.europa.eu/about-edpb/faq-frequently-asked-questions/what-are-my-rights-under-gdpr_en) you can excercise. For Nighttune, the "Right of data portability" and the "Right to reasure" are fully automated so that you can excercise them at will.
To do so, go to [Nighttune](https://nighttune.app) and click on the `My Data` step for further instructions.

Additionally, you can excercise the "Right of Access" by visiting the Application and inspect your data there.

If you want to excercise another right under the GDPR, please contact Nighttune at [help@nighttune.app](mailto:help@nighttune.app) and explain your situation. We will then help you within a reasonable amount of time.

## What is the data retention policy and how can you manage your information?

The Service Provider will retain User Provided data for as long as you use the Application and for a reasonable time thereafter. The Service Provider will retain Automatically Collected information for up to 24 months and thereafter may store it in aggregate, unrelateable to you or another individual.

## How is your information kept secure?

The Service Provider are concerned about safeguarding the confidentiality of your information. The Service Provider provide physical, electronic, and procedural safeguards to protect information we process and maintain. For example, access to this information is limited to the Service Provider only, in order to operate, develop or improve the Application. Please be aware that, although we endeavor provide reasonable security for information we process and maintain, no security system can prevent all potential security breaches.

## How will you be informed of changes to this Privacy Policy?

This Privacy Policy may be updated from time to time for any reason. The Service Provider will notify you of any changes to the Privacy Policy by updating this page with the new Privacy Policy. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.

## How do you give your consent?

By providing your Nightscout details to the Application, you are giving your consent to the Service Provider processing your information as set forth in this Privacy Policy now and as amended by us. "Processing,” means using cookies on a computer/hand held device or using or touching information in any way, including, but not limited to, collecting, storing, deleting, using, combining and disclosing information.

## How can you contact us?

If you have any questions regarding privacy policy while using the Application, or have questions about the practices, please contact the Service Provider via email at [help@nighttune.app](mailto:help@nighttune.app).

* * *

This privacy policy page was largely inspired by [App Privacy Policy Generator](https://app-privacy-policy-generator.nisrulz.com/)
