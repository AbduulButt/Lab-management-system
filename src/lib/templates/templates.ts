import type { TestTemplate } from "./types";

export const PREDEFINED_TEMPLATES: TestTemplate[] = [
  {
    "key": "CBC",
    "aliases": [
      "CBC",
      "COMPLETE BLOOD EXAMINATION",
      "COMPLETE BLOOD COUNT"
    ],
    "title": "CBC-Blood Complete Examination",
    "sections": [
      {
        "sectionName": "DIFFERENTIAL LEUKOCYTES COUNT",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "257",
            "fieldName": "Band Cells",
            "inputType": "NUMBER",
            "unit": "%",
            "displayOrder": 1
          },
          {
            "fieldCode": "257",
            "fieldName": "Basophils",
            "inputType": "NUMBER",
            "femaleRangeText": "< 01",
            "maleRangeText": "< 01",
            "unit": "%",
            "displayOrder": 2
          },
          {
            "fieldCode": "257",
            "fieldName": "Blasts",
            "inputType": "NUMBER",
            "unit": "%",
            "displayOrder": 3
          },
          {
            "fieldCode": "257",
            "fieldName": "Eosinophils",
            "inputType": "NUMBER",
            "femaleRangeText": "01 - 06",
            "maleRangeText": "01 - 06",
            "unit": "%",
            "displayOrder": 4
          },
          {
            "fieldCode": "257",
            "fieldName": "Lymphocytes",
            "inputType": "NUMBER",
            "femaleRangeText": "20 - 45",
            "maleRangeText": "20 - 45",
            "unit": "%",
            "displayOrder": 5
          },
          {
            "fieldCode": "257",
            "fieldName": "Metamyelocyte",
            "inputType": "NUMBER",
            "unit": "%",
            "displayOrder": 6
          },
          {
            "fieldCode": "257",
            "fieldName": "Monocytes",
            "inputType": "NUMBER",
            "femaleRangeText": "02 - 10",
            "maleRangeText": "02 - 10",
            "unit": "%",
            "displayOrder": 7
          },
          {
            "fieldCode": "257",
            "fieldName": "Myelocytes",
            "inputType": "NUMBER",
            "unit": "%",
            "displayOrder": 8
          },
          {
            "fieldCode": "257",
            "fieldName": "Neutrophils",
            "inputType": "NUMBER",
            "femaleRangeText": "40 - 75",
            "maleRangeText": "40 - 75",
            "unit": "%",
            "displayOrder": 9
          },
          {
            "fieldCode": "257",
            "fieldName": "Normoblasts",
            "inputType": "NUMBER",
            "unit": "%",
            "displayOrder": 10
          },
          {
            "fieldCode": "257",
            "fieldName": "NRB's",
            "inputType": "NUMBER",
            "unit": "%",
            "displayOrder": 11
          },
          {
            "fieldCode": "257",
            "fieldName": "Promyelocytes",
            "inputType": "NUMBER",
            "unit": "%",
            "displayOrder": 12
          }
        ]
      },
      {
        "sectionName": "BLOOD COMPLETE COUNT",
        "displayOrder": 2,
        "fields": [
          {
            "fieldCode": "257",
            "fieldName": "ESR ( WG )",
            "inputType": "NUMBER",
            "femaleRangeText": "1 - 20",
            "maleRangeText": "1 - 10",
            "unit": "mm/1st an Hour",
            "displayOrder": 1
          },
          {
            "fieldCode": "257",
            "fieldName": "Haemoglobin (Hb)",
            "inputType": "NUMBER",
            "femaleRangeText": "11.5 - 16.0",
            "maleRangeText": "13 - 18",
            "unit": "g/dl",
            "displayOrder": 2
          },
          {
            "fieldCode": "257",
            "fieldName": "HCT (PVC)",
            "inputType": "NUMBER",
            "femaleRangeText": "36 - 46",
            "maleRangeText": "38 - 52",
            "unit": "%",
            "displayOrder": 3
          },
          {
            "fieldCode": "257",
            "fieldName": "MCH",
            "inputType": "NUMBER",
            "femaleRangeText": "27 - 32",
            "maleRangeText": "27 - 32",
            "unit": "pg",
            "displayOrder": 4
          },
          {
            "fieldCode": "257",
            "fieldName": "MCHC",
            "inputType": "NUMBER",
            "femaleRangeText": "30 - 35",
            "maleRangeText": "30 - 35",
            "unit": "g/dL",
            "displayOrder": 5
          },
          {
            "fieldCode": "257",
            "fieldName": "MCV",
            "inputType": "NUMBER",
            "femaleRangeText": "76 - 96",
            "maleRangeText": "80 - 96",
            "unit": "fL",
            "displayOrder": 6
          },
          {
            "fieldCode": "257",
            "fieldName": "Platelets",
            "inputType": "NUMBER",
            "femaleRangeText": "150 - 450",
            "maleRangeText": "150 - 450",
            "unit": "x10 /uL",
            "displayOrder": 7
          },
          {
            "fieldCode": "257",
            "fieldName": "Total RBC",
            "inputType": "NUMBER",
            "femaleRangeText": "4.0 - 5.5",
            "maleRangeText": "4.5 - 6.0",
            "unit": "x10 /uL",
            "displayOrder": 8
          },
          {
            "fieldCode": "257",
            "fieldName": "WBC (TLC)",
            "inputType": "NUMBER",
            "femaleRangeText": "4 - 11",
            "maleRangeText": "4 - 11",
            "unit": "x10 /uL",
            "displayOrder": 9
          }
        ]
      }
    ]
  },
  {
    "key": "CRP",
    "aliases": [
      "CRP",
      "C-REACTIVE PROTEIN"
    ],
    "title": "CRP (High Sensitivity)",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "171",
            "fieldName": "-",
            "inputType": "TEXT",
            "displayOrder": 1
          },
          {
            "fieldCode": "171",
            "fieldName": "C-Reactive Protein",
            "inputType": "NUMBER",
            "femaleRangeText": "6.0",
            "maleRangeText": "6.0",
            "unit": "mg/L",
            "displayOrder": 2
          }
        ]
      }
    ]
  },
  {
    "key": "TSH",
    "aliases": [
      "TSH"
    ],
    "title": "TSH (Thyroid Stimulating Hormone)",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "492",
            "fieldName": "TSH",
            "inputType": "NUMBER",
            "femaleRangeText": "0.2 - 5.0",
            "maleRangeText": "0.2 - 5.0",
            "unit": "mIU/L",
            "displayOrder": 1
          }
        ]
      }
    ]
  },
  {
    "key": "ANTI_HCV",
    "aliases": [
      "ANTI HCV",
      "ANTI-HCV"
    ],
    "title": "Anti HCV (Screening)",
    "sections": [
      {
        "sectionName": "CLINICAL INTERPRETATION",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "60",
            "fieldName": "",
            "inputType": "TEXT",
            "displayOrder": 1
          },
          {
            "fieldCode": "60",
            "fieldName": "Anti HCV",
            "inputType": "POSITIVE_NEGATIVE",
            "femaleRangeText": "Negative",
            "maleRangeText": "Negative",
            "options": [
              "Negative",
              "Positive"
            ],
            "displayOrder": 2
          }
        ]
      }
    ]
  },
  {
    "key": "HBSAG",
    "aliases": [
      "HBSAG"
    ],
    "title": "HBsAg (Screening)",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "268",
            "fieldName": "HBsAg",
            "inputType": "POSITIVE_NEGATIVE",
            "femaleRangeText": "Negative",
            "maleRangeText": "Negative",
            "options": [
              "Negative",
              "Positive"
            ],
            "displayOrder": 1
          }
        ]
      }
    ]
  },
  {
    "key": "ESR",
    "aliases": [
      "ESR"
    ],
    "title": "ESR",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "215",
            "fieldName": "ESR",
            "inputType": "NUMBER",
            "femaleRangeText": "1 - 20",
            "maleRangeText": "1 - 10",
            "unit": "mm/1st Hour",
            "displayOrder": 1
          }
        ]
      }
    ]
  },
  {
    "key": "HBA1C",
    "aliases": [
      "HBA1C",
      "HB A1C"
    ],
    "title": "HbA1C (Glycosylated Haemoglobin)",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "265",
            "fieldName": "Sugar",
            "inputType": "NUMBER",
            "femaleRangeText": "upto 120",
            "maleRangeText": "upto 120",
            "unit": "mg/dl",
            "displayOrder": 1
          },
          {
            "fieldCode": "265",
            "fieldName": "HbA1C (Glycosylated Hemoglobin)",
            "inputType": "NUMBER",
            "femaleRangeText": "See Below",
            "maleRangeText": "See Below",
            "unit": "%",
            "displayOrder": 2
          }
        ]
      }
    ]
  },
  {
    "key": "URIC_ACID",
    "aliases": [
      "URIC ACID"
    ],
    "title": "Uric Acid",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "498",
            "fieldName": "Uric Acid",
            "inputType": "NUMBER",
            "femaleRangeText": "2.4 - 5.7",
            "maleRangeText": "3.4 - 7.0",
            "unit": "mg/dl",
            "displayOrder": 1
          }
        ]
      }
    ]
  },
  {
    "key": "RFT",
    "aliases": [
      "RFT",
      "RENAL FUNCTION"
    ],
    "title": "RFT/Renal Function",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "109",
            "fieldName": "Creatinine",
            "inputType": "NUMBER",
            "femaleRangeText": "0.5 - 1.1",
            "maleRangeText": "0.5 - 1.2",
            "unit": "mg/dl",
            "displayOrder": 1
          },
          {
            "fieldCode": "109",
            "fieldName": "Urea",
            "inputType": "NUMBER",
            "femaleRangeText": "10 - 50",
            "maleRangeText": "10 - 50",
            "unit": "mg/dl",
            "displayOrder": 2
          },
          {
            "fieldCode": "109",
            "fieldName": "Uric Acid",
            "inputType": "NUMBER",
            "femaleRangeText": "2.4 - 5.7",
            "maleRangeText": "3.4 - 7.0",
            "unit": "mg/dl",
            "displayOrder": 3
          }
        ]
      }
    ]
  },
  {
    "key": "SERUM_ELECTROLYTES",
    "aliases": [
      "SERUM ELECTROLYTES",
      "ELECTROLYTES"
    ],
    "title": "Serum Electrolytes (Na,K,Cl,HCO3)",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "412",
            "fieldName": "Bicarbonate (HCO3)",
            "inputType": "NUMBER",
            "femaleRangeText": "24 - 30",
            "maleRangeText": "24 - 30",
            "unit": "mmol/L",
            "displayOrder": 1
          },
          {
            "fieldCode": "412",
            "fieldName": "Chloride (Cl-)",
            "inputType": "NUMBER",
            "femaleRangeText": "92 - 108",
            "maleRangeText": "92 - 108",
            "unit": "mg/dl",
            "displayOrder": 2
          },
          {
            "fieldCode": "412",
            "fieldName": "Potassium (K+)",
            "inputType": "NUMBER",
            "femaleRangeText": "3.4 - 5.5",
            "maleRangeText": "3.4 - 5.5",
            "unit": "mmol/L",
            "displayOrder": 3
          },
          {
            "fieldCode": "412",
            "fieldName": "Sodium (Na+)",
            "inputType": "NUMBER",
            "femaleRangeText": "135 - 155",
            "maleRangeText": "135 - 155",
            "unit": "mmol/L",
            "displayOrder": 4
          }
        ]
      }
    ]
  },
  {
    "key": "LFT",
    "aliases": [
      "LFT",
      "LIVER FUNCTION TESTS"
    ],
    "title": "LFT-Liver Functions Tests",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "578",
            "fieldName": "A/G Ratio",
            "inputType": "NUMBER",
            "unit": "%",
            "displayOrder": 1
          },
          {
            "fieldCode": "578",
            "fieldName": "Albumin",
            "inputType": "NUMBER",
            "femaleRangeText": "3.4 - 5.4",
            "maleRangeText": "3.4 - 5.4",
            "unit": "g/dl",
            "displayOrder": 2
          },
          {
            "fieldCode": "578",
            "fieldName": "Alkaline Phasphatase",
            "inputType": "NUMBER",
            "femaleRangeText": "65 - 306",
            "maleRangeText": "65 - 306",
            "unit": "U/L",
            "displayOrder": 3
          },
          {
            "fieldCode": "578",
            "fieldName": "Bilirubin Direct",
            "inputType": "NUMBER",
            "femaleRangeText": "0.1 - 0.70",
            "maleRangeText": "0.1 - 0.70",
            "unit": "mg/dl",
            "displayOrder": 4
          },
          {
            "fieldCode": "578",
            "fieldName": "Bilirubin Indirect",
            "inputType": "NUMBER",
            "femaleRangeText": "0.1 - 0.40",
            "maleRangeText": "0.1 - 0.40",
            "unit": "mg/dl",
            "displayOrder": 5
          },
          {
            "fieldCode": "578",
            "fieldName": "Bilirubin Total",
            "inputType": "NUMBER",
            "femaleRangeText": "0.2 - 1.1",
            "maleRangeText": "0.2 - 1.1",
            "unit": "mg/dl",
            "displayOrder": 6
          },
          {
            "fieldCode": "578",
            "fieldName": "Gamma G.T.",
            "inputType": "NUMBER",
            "femaleRangeText": "7 - 32",
            "maleRangeText": "7 - 32",
            "unit": "U/L",
            "displayOrder": 7
          },
          {
            "fieldCode": "578",
            "fieldName": "Globulin",
            "inputType": "NUMBER",
            "femaleRangeText": "2.5 - 3.5",
            "maleRangeText": "2.5 - 3.5",
            "unit": "g/dl",
            "displayOrder": 8
          },
          {
            "fieldCode": "578",
            "fieldName": "SGOT (AST)",
            "inputType": "NUMBER",
            "femaleRangeText": "5 - 40",
            "maleRangeText": "5 - 40",
            "unit": "U/L",
            "displayOrder": 9
          },
          {
            "fieldCode": "578",
            "fieldName": "SGPT (ALT)",
            "inputType": "NUMBER",
            "femaleRangeText": "5 - 42",
            "maleRangeText": "5 - 42",
            "unit": "U/L",
            "displayOrder": 10
          },
          {
            "fieldCode": "578",
            "fieldName": "Total Proteins",
            "inputType": "NUMBER",
            "femaleRangeText": "6.4 - 8.3",
            "maleRangeText": "6.4 - 8.3",
            "unit": "g/dl",
            "displayOrder": 11
          }
        ]
      }
    ]
  },
  {
    "key": "H_PYLORI",
    "aliases": [
      "H. PYLORI",
      "H PYLORI"
    ],
    "title": "H. Pylori",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "868",
            "fieldName": "Helicobacter Pylori Abs (Screening)",
            "inputType": "POSITIVE_NEGATIVE",
            "femaleRangeText": "Negative",
            "maleRangeText": "Negative",
            "options": [
              "Negative",
              "Positive"
            ],
            "displayOrder": 1
          }
        ]
      }
    ]
  },
  {
    "key": "LIPID_PROFILE",
    "aliases": [
      "LIPID PROFILE"
    ],
    "title": "Lipid Profile",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "318",
            "fieldName": "",
            "inputType": "TEXT",
            "femaleRangeText": "- With Known Coronary Artery Disease Less Than Or Equal to 160: OPTIMAL",
            "displayOrder": 1
          },
          {
            "fieldCode": "318",
            "fieldName": "",
            "inputType": "TEXT",
            "femaleRangeText": "- Without Known Coronary Artery Disease Less Than Or Equal to 200: DESIRABLE",
            "maleRangeText": "- Without Known Coronary Artery Disease Less Than Or Equal to 200: DESIRABLE",
            "displayOrder": 2
          },
          {
            "fieldCode": "318",
            "fieldName": "",
            "inputType": "TEXT",
            "femaleRangeText": "- With known Coronary Artery Disease Less than Or Equal to 35: OPTIMAL",
            "maleRangeText": "- With known Coronary Artery Disease Less than Or Equal to 35: OPTIMAL",
            "displayOrder": 3
          },
          {
            "fieldCode": "318",
            "fieldName": "",
            "inputType": "TEXT",
            "femaleRangeText": "- Without known Coronary Artery Disease More than Or Equal to 55: DESIRABLE",
            "maleRangeText": "- Without known Coronary Artery Disease More than Or Equal to 55: DESIRABLE",
            "displayOrder": 4
          },
          {
            "fieldCode": "318",
            "fieldName": "Cholesterol",
            "inputType": "NUMBER",
            "femaleRangeText": "Below 200 mg/dL(Desirable) 200-239 mg/dL(Borderline high) 240 mg/dL and above(High)",
            "maleRangeText": "Below 200 mg/dL(Desirable) 200-239 mg/dL(Borderline high) 240 mg/dL and above(High)",
            "unit": "mg/dL",
            "displayOrder": 5
          },
          {
            "fieldCode": "318",
            "fieldName": "Chylomicrons",
            "inputType": "NUMBER",
            "femaleRangeText": "0- 100",
            "maleRangeText": "0- 100",
            "unit": "mg/dl",
            "displayOrder": 6
          },
          {
            "fieldCode": "318",
            "fieldName": "HDL Cholestrol",
            "inputType": "NUMBER",
            "femaleRangeText": "Below 50 mg/dL (Poor) 50-59 mg/dL (Better) 60 mg/dL and above (Best)",
            "maleRangeText": "Below 40 mg/dL (Poor) 40-59 mg/dL (Better) 60 mg/dL and above (Best)",
            "unit": "mg/dL",
            "displayOrder": 7
          },
          {
            "fieldCode": "318",
            "fieldName": "LDL Cholestrol",
            "inputType": "NUMBER",
            "femaleRangeText": "Upto 150",
            "maleRangeText": "Upto 150",
            "unit": "mg/dl",
            "displayOrder": 8
          },
          {
            "fieldCode": "318",
            "fieldName": "Risk Factor",
            "inputType": "NUMBER",
            "displayOrder": 9
          },
          {
            "fieldCode": "318",
            "fieldName": "Total Lipids",
            "inputType": "NUMBER",
            "femaleRangeText": "450 - 1000",
            "maleRangeText": "450 - 1000",
            "unit": "mg/dl",
            "displayOrder": 10
          },
          {
            "fieldCode": "318",
            "fieldName": "Triglycerides",
            "inputType": "NUMBER",
            "femaleRangeText": "Below 150 mg/dL (Desirable) 150-199 mg/dL (Borderline high) 200-499 mg/dL (High) 500 mg/dL and above (Very high)",
            "maleRangeText": "Below 150 mg/dL (Desirable) 150-199 mg/dL (Borderline high) 200-499 mg/dL (High) 500 mg/dL and above (Very high)",
            "unit": "mg/dL",
            "displayOrder": 11
          },
          {
            "fieldCode": "318",
            "fieldName": "VLDL",
            "inputType": "NUMBER",
            "femaleRangeText": "Upto 25",
            "maleRangeText": "Upto 25",
            "unit": "mg/dl",
            "displayOrder": 12
          }
        ]
      }
    ]
  },
  {
    "key": "BETA_HCG",
    "aliases": [
      "BETA HCG"
    ],
    "title": "Beta HCG",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "99",
            "fieldName": "Beta HCG",
            "inputType": "NUMBER",
            "femaleRangeText": "(See Below)",
            "maleRangeText": "(See Below)..",
            "unit": "mIU/ml",
            "displayOrder": 1
          }
        ]
      }
    ]
  },
  {
    "key": "FT4",
    "aliases": [
      "FT4",
      "FREE T4",
      "FREE T-4"
    ],
    "title": "Free T-4 (Free Thyroxine)",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "239",
            "fieldName": "Free T-4 (Thyroxine)",
            "inputType": "NUMBER",
            "femaleRangeText": "7.8-14.4",
            "maleRangeText": "7.8-14.4",
            "unit": "Pmol/L",
            "displayOrder": 1
          },
          {
            "fieldCode": "239",
            "fieldName": "Free T-4 (Thyroxine)",
            "inputType": "NUMBER",
            "femaleRangeText": "0.70-1.48",
            "maleRangeText": "0.70-1.48",
            "unit": "ng/dl",
            "displayOrder": 2
          }
        ]
      }
    ]
  },
  {
    "key": "BSR",
    "aliases": [
      "BSR",
      "SUGAR 1/2 HOUR ABF"
    ],
    "title": "Sugar 1/2 Hour ABF",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "442",
            "fieldName": "1/2 Hour ABF",
            "inputType": "NUMBER",
            "femaleRangeText": "Upto: 180",
            "maleRangeText": "Upto: 180",
            "unit": "mg/dl",
            "displayOrder": 1
          },
          {
            "fieldCode": "442",
            "fieldName": "SUGAR",
            "inputType": "NUMBER",
            "femaleRangeText": "upto 120",
            "maleRangeText": "upto 120",
            "unit": "mg/dl",
            "displayOrder": 2
          }
        ]
      }
    ]
  },
  {
    "key": "BLOOD_GROUP",
    "aliases": [
      "BLOOD GROUP",
      "BLOOD GROUP & RH FACTOR"
    ],
    "title": "Blood Group & Rh Factor",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "118",
            "fieldName": "Blood Group",
            "inputType": "SELECT",
            "options": [
              "A+",
              "A-",
              "B+",
              "B-",
              "AB+",
              "AB-",
              "O+",
              "O-"
            ],
            "displayOrder": 1
          },
          {
            "fieldCode": "118",
            "fieldName": "Rh Factor",
            "inputType": "SELECT",
            "options": [
              "Positive",
              "Negative"
            ],
            "displayOrder": 2
          }
        ]
      }
    ]
  },
  {
    "key": "TROP_T",
    "aliases": [
      "TROP-T",
      "TROPONIN-T"
    ],
    "title": "Troponin-T",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "491",
            "fieldName": "Troponin-T",
            "inputType": "POSITIVE_NEGATIVE",
            "femaleRangeText": "Negative",
            "maleRangeText": "Negative",
            "options": [
              "Negative",
              "Positive"
            ],
            "displayOrder": 1
          }
        ]
      }
    ]
  },
  {
    "key": "ANA",
    "aliases": [
      "ANA"
    ],
    "title": "ANA",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "19",
            "fieldName": "ANA",
            "inputType": "POSITIVE_NEGATIVE",
            "femaleRangeText": "Negative",
            "maleRangeText": "Negative",
            "options": [
              "Negative",
              "Positive"
            ],
            "displayOrder": 1
          }
        ]
      }
    ]
  },
  {
    "key": "CROSS_MATCHING_SCREENING",
    "aliases": [
      "CROSS MATCHING WITH SCREENING",
      "CROSS MATCHING",
      "CROSSMATCHING"
    ],
    "title": "Cross Matching with Screening",
    "sections": [
      {
        "sectionName": "PATIENT",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "732",
            "fieldName": "-",
            "inputType": "TEXT",
            "displayOrder": 1
          },
          {
            "fieldCode": "732",
            "fieldName": "Blood Group",
            "inputType": "SELECT",
            "options": [
              "A+",
              "A-",
              "B+",
              "B-",
              "AB+",
              "AB-",
              "O+",
              "O-"
            ],
            "displayOrder": 2
          },
          {
            "fieldCode": "732",
            "fieldName": "Name",
            "inputType": "TEXT",
            "displayOrder": 3
          },
          {
            "fieldCode": "732",
            "fieldName": "Rh Factor",
            "inputType": "SELECT",
            "options": [
              "POSITIVE",
              "NEGATIVE"
            ],
            "displayOrder": 4
          }
        ]
      },
      {
        "sectionName": "DONOR",
        "displayOrder": 2,
        "fields": [
          {
            "fieldCode": "732",
            "fieldName": "-",
            "inputType": "TEXT",
            "displayOrder": 1
          },
          {
            "fieldCode": "732",
            "fieldName": "Blood Bag No",
            "inputType": "TEXT",
            "displayOrder": 2
          },
          {
            "fieldCode": "732",
            "fieldName": "Blood Group",
            "inputType": "SELECT",
            "options": [
              "A+",
              "A-",
              "B+",
              "B-",
              "AB+",
              "AB-",
              "O+",
              "O-"
            ],
            "displayOrder": 3
          },
          {
            "fieldCode": "732",
            "fieldName": "Cross Matching",
            "inputType": "SELECT",
            "options": [
              "COMPATIBLE",
              "INCOMPATIBLE"
            ],
            "displayOrder": 4
          },
          {
            "fieldCode": "732",
            "fieldName": "Name",
            "inputType": "TEXT",
            "displayOrder": 5
          },
          {
            "fieldCode": "732",
            "fieldName": "Rh Factor",
            "inputType": "SELECT",
            "options": [
              "POSITIVE",
              "NEGATIVE"
            ],
            "displayOrder": 6
          }
        ]
      },
      {
        "sectionName": "SCREENING REPORT",
        "displayOrder": 3,
        "fields": [
          {
            "fieldCode": "732",
            "fieldName": "Anti HCV",
            "inputType": "POSITIVE_NEGATIVE",
            "femaleRangeText": "Negative",
            "maleRangeText": "Negative",
            "options": [
              "Negative",
              "Positive"
            ],
            "displayOrder": 1
          },
          {
            "fieldCode": "732",
            "fieldName": "HB",
            "inputType": "NUMBER",
            "femaleRangeText": "13-18",
            "maleRangeText": "13-18",
            "unit": "g/dl",
            "displayOrder": 2
          },
          {
            "fieldCode": "732",
            "fieldName": "HBsAg",
            "inputType": "POSITIVE_NEGATIVE",
            "femaleRangeText": "Negative",
            "maleRangeText": "Negative",
            "options": [
              "Negative",
              "Positive"
            ],
            "displayOrder": 3
          },
          {
            "fieldCode": "732",
            "fieldName": "HIV",
            "inputType": "POSITIVE_NEGATIVE",
            "femaleRangeText": "Negative",
            "maleRangeText": "Negative",
            "options": [
              "Negative",
              "Positive"
            ],
            "displayOrder": 4
          },
          {
            "fieldCode": "732",
            "fieldName": "MP",
            "inputType": "POSITIVE_NEGATIVE",
            "femaleRangeText": "Negative",
            "maleRangeText": "Negative",
            "options": [
              "Negative",
              "Positive"
            ],
            "displayOrder": 5
          },
          {
            "fieldCode": "732",
            "fieldName": "VDRL",
            "inputType": "SELECT",
            "femaleRangeText": "Non-Reactive",
            "maleRangeText": "Non-Reactive",
            "options": [
              "Non-Reactive",
              "Reactive"
            ],
            "displayOrder": 6
          }
        ]
      }
    ]
  },
  {
    "key": "URINE_COMPLETE_EXAMINATION",
    "aliases": [
      "URINE COMPLETE EXAMINATION",
      "URINE C/E",
      "URINE CE",
      "URINE COMPLETE"
    ],
    "title": "Urine Complete Examination",
    "sections": [
      {
        "sectionName": "MICROSCOPIC EXAMINATION",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "528",
            "fieldName": "Amorphous",
            "inputType": "TEXT",
            "femaleRangeText": "NILL",
            "maleRangeText": "NILL",
            "unit": "/HPF",
            "displayOrder": 1
          },
          {
            "fieldCode": "528",
            "fieldName": "Bacteria",
            "inputType": "TEXT",
            "femaleRangeText": "NILL",
            "maleRangeText": "NILL",
            "unit": "/HPF",
            "displayOrder": 2
          },
          {
            "fieldCode": "528",
            "fieldName": "Casts",
            "inputType": "TEXT",
            "femaleRangeText": "NILL",
            "maleRangeText": "NILL",
            "unit": "/lpf",
            "displayOrder": 3
          },
          {
            "fieldCode": "528",
            "fieldName": "Crystals",
            "inputType": "TEXT",
            "femaleRangeText": "NILL",
            "maleRangeText": "NILL",
            "unit": "/HPF",
            "displayOrder": 4
          },
          {
            "fieldCode": "528",
            "fieldName": "Epithelial Cell",
            "inputType": "TEXT",
            "femaleRangeText": "00-01",
            "maleRangeText": "00-01",
            "unit": "/HPF",
            "displayOrder": 5
          },
          {
            "fieldCode": "528",
            "fieldName": "Msc.",
            "inputType": "TEXT",
            "unit": "/HPF",
            "displayOrder": 6
          },
          {
            "fieldCode": "528",
            "fieldName": "Mucous",
            "inputType": "TEXT",
            "femaleRangeText": "NILL",
            "maleRangeText": "NILL",
            "unit": "/HPF",
            "displayOrder": 7
          },
          {
            "fieldCode": "528",
            "fieldName": "Pus Cells",
            "inputType": "TEXT",
            "femaleRangeText": "02-04",
            "maleRangeText": "02-04",
            "unit": "/HPF",
            "displayOrder": 8
          },
          {
            "fieldCode": "528",
            "fieldName": "RBC",
            "inputType": "TEXT",
            "femaleRangeText": "00-02",
            "maleRangeText": "00-02",
            "unit": "/HPF",
            "displayOrder": 9
          },
          {
            "fieldCode": "528",
            "fieldName": "Spermatozoa",
            "inputType": "TEXT",
            "femaleRangeText": "NILL",
            "maleRangeText": "NILL",
            "unit": "/HPF",
            "displayOrder": 10
          },
          {
            "fieldCode": "528",
            "fieldName": "Yeast Cells",
            "inputType": "TEXT",
            "femaleRangeText": "NILL",
            "maleRangeText": "NILL",
            "unit": "/HPF",
            "displayOrder": 11
          }
        ]
      },
      {
        "sectionName": "CHEMICAL ANALYSIS",
        "displayOrder": 2,
        "fields": [
          {
            "fieldCode": "528",
            "fieldName": "Bilirubin",
            "inputType": "TEXT",
            "femaleRangeText": "NILL",
            "maleRangeText": "NILL",
            "displayOrder": 1
          },
          {
            "fieldCode": "528",
            "fieldName": "Blood",
            "inputType": "TEXT",
            "femaleRangeText": "NILL",
            "maleRangeText": "NILL",
            "displayOrder": 2
          },
          {
            "fieldCode": "528",
            "fieldName": "Glucose",
            "inputType": "TEXT",
            "femaleRangeText": "NILL",
            "maleRangeText": "NILL",
            "displayOrder": 3
          },
          {
            "fieldCode": "528",
            "fieldName": "Ketone",
            "inputType": "TEXT",
            "femaleRangeText": "NILL",
            "maleRangeText": "NILL",
            "displayOrder": 4
          },
          {
            "fieldCode": "528",
            "fieldName": "Leucocytes",
            "inputType": "TEXT",
            "femaleRangeText": "NILL",
            "maleRangeText": "NILL",
            "displayOrder": 5
          },
          {
            "fieldCode": "528",
            "fieldName": "pH",
            "inputType": "NUMBER",
            "femaleRangeText": "4.5-8",
            "maleRangeText": "4.5-8",
            "displayOrder": 6
          },
          {
            "fieldCode": "528",
            "fieldName": "Protein",
            "inputType": "TEXT",
            "femaleRangeText": "NILL",
            "maleRangeText": "NILL",
            "displayOrder": 7
          },
          {
            "fieldCode": "528",
            "fieldName": "Urobilinogen",
            "inputType": "TEXT",
            "femaleRangeText": "NILL",
            "maleRangeText": "NILL",
            "displayOrder": 8
          }
        ]
      },
      {
        "sectionName": "PHYSICAL EXAMINATION",
        "displayOrder": 3,
        "fields": [
          {
            "fieldCode": "528",
            "fieldName": "Color",
            "inputType": "TEXT",
            "femaleRangeText": "Yellow",
            "maleRangeText": "Yellow",
            "displayOrder": 1
          },
          {
            "fieldCode": "528",
            "fieldName": "Deposit",
            "inputType": "TEXT",
            "femaleRangeText": "NILL",
            "maleRangeText": "NILL",
            "displayOrder": 2
          },
          {
            "fieldCode": "528",
            "fieldName": "Sp. Gravity",
            "inputType": "NUMBER",
            "femaleRangeText": "1.005-1.025",
            "maleRangeText": "1.005-1.025",
            "displayOrder": 3
          },
          {
            "fieldCode": "528",
            "fieldName": "Turbidity",
            "inputType": "TEXT",
            "femaleRangeText": "NILL",
            "maleRangeText": "NILL",
            "displayOrder": 4
          }
        ]
      }
    ]
  },
  {
    "key": "AMYLASE_SERUM",
    "aliases": [
      "AMYLASE SERUM",
      "AMYLASE (SERUM)",
      "SERUM AMYLASE"
    ],
    "title": "AMYLASE (SERUM)",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "40",
            "fieldName": "Serum Amylase",
            "inputType": "NUMBER",
            "femaleRangeText": "0.0 - 90.0",
            "maleRangeText": "0.0 - 90.0",
            "unit": "U/l",
            "displayOrder": 1
          }
        ]
      }
    ]
  },
  {
    "key": "RA_FACTOR_QL",
    "aliases": [
      "RA FACTOR",
      "RA FACTOR (QL)",
      "RHEUMATOID FACTOR",
      "RHEUMATOID FACTOR QUALITATIVE"
    ],
    "title": "RA FACTOR (QL)",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "881",
            "fieldName": "",
            "inputType": "TEXT",
            "femaleRangeText": "NEGATIVE",
            "maleRangeText": "NEGATIVE",
            "unit": "0",
            "displayOrder": 1
          },
          {
            "fieldCode": "881",
            "fieldName": "RA FACTOR",
            "inputType": "POSITIVE_NEGATIVE",
            "options": [
              "Negative",
              "Positive"
            ],
            "displayOrder": 2
          },
          {
            "fieldCode": "881",
            "fieldName": "RA FACTOR",
            "inputType": "POSITIVE_NEGATIVE",
            "femaleRangeText": "NEGATIVE",
            "maleRangeText": "NEGATIVE",
            "options": [
              "Negative",
              "Positive"
            ],
            "displayOrder": 3
          }
        ]
      }
    ]
  },
  {
    "key": "ANTI_CCP",
    "aliases": [
      "ANTI CCP",
      "ANTI-CCP",
      "ANTI CCP (CPA)",
      "ANTI CYCLIC CITRULLINATED PEPTIDE"
    ],
    "title": "Anti-CCP",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "877",
            "fieldName": "Anti CCP (CPA)",
            "inputType": "NUMBER",
            "femaleRangeText": "(See Below)",
            "maleRangeText": "(See Below)",
            "unit": "U/ml",
            "displayOrder": 1
          },
          {
            "fieldCode": "877",
            "fieldName": "",
            "inputType": "TEXT",
            "femaleRangeText": "Negative:<10 Positive >10",
            "maleRangeText": "Negative:<10 Positive >10",
            "unit": "U/ml",
            "displayOrder": 2
          }
        ]
      }
    ]
  },
  {
    "key": "PT_PROTHROMBIN_TIME",
    "aliases": [
      "PT",
      "PROTHROMBIN TIME",
      "PT (PROTHROMBIN TIME)",
      "PROTHROMBIN TIME FACTOR-II"
    ],
    "title": "PT (Prothrombin Time) Factor-II",
    "sections": [
      {
        "sectionName": "COAGULATION PROFILE",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "388",
            "fieldName": "Control",
            "inputType": "NUMBER",
            "femaleRangeText": "14sec",
            "maleRangeText": "14sec",
            "unit": "Sec.",
            "displayOrder": 1
          },
          {
            "fieldCode": "388",
            "fieldName": "INR",
            "inputType": "NUMBER",
            "displayOrder": 2
          },
          {
            "fieldCode": "388",
            "fieldName": "Prothrombin Time",
            "inputType": "NUMBER",
            "femaleRangeText": "15sec",
            "maleRangeText": "15sec",
            "unit": "Sec.",
            "displayOrder": 3
          },
          {
            "fieldCode": "388",
            "fieldName": "ISI Value as per KIT",
            "inputType": "NUMBER",
            "unit": "1.1",
            "displayOrder": 4
          }
        ]
      }
    ]
  },
  {
    "key": "APTT",
    "aliases": [
      "APTT",
      "ACTIVATED PARTIAL THROMBOPLASTIN TIME",
      "APTT (ACTIVATED PARTIAL THROMBOPLASTIN TIME)"
    ],
    "title": "APTT (Activated Partial Thromboplastin Time)",
    "sections": [
      {
        "sectionName": "COAGULATION PROFILE",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "23",
            "fieldName": "APTT",
            "inputType": "NUMBER",
            "femaleRangeText": "32-45sec",
            "maleRangeText": "32-45sec",
            "unit": "Sec.",
            "displayOrder": 1
          },
          {
            "fieldCode": "23",
            "fieldName": "Control",
            "inputType": "NUMBER",
            "femaleRangeText": "40sec",
            "maleRangeText": "40sec",
            "unit": "Sec.",
            "displayOrder": 2
          }
        ]
      }
    ]
  },
  {
    "key": "INR",
    "aliases": [
      "INR",
      "INTERNATIONAL NORMALIZED RATIO"
    ],
    "title": "INR",
    "sections": [
      {
        "sectionName": "",
        "displayOrder": 1,
        "fields": [
          {
            "fieldCode": "832",
            "fieldName": "INR",
            "inputType": "NUMBER",
            "displayOrder": 1
          }
        ]
      }
    ]
  },
  {
    key: "CHOLESTEROL",
    aliases: [
      "CHOLESTEROL",
      "CHOLESTROL",
      "SERUM CHOLESTEROL",
    ],
    title: "Cholesterol",
    sections: [
      {
        sectionName: "",
        displayOrder: 1,
        fields: [
          {
            fieldCode: "147",
            fieldName: "",
            inputType: "TEXT",
            displayOrder: 1,
          },
          {
            fieldCode: "147",
            fieldName: "",
            inputType: "TEXT",
            displayOrder: 2,
          },
          {
            fieldCode: "147",
            fieldName: "Cholesterol",
            inputType: "NUMBER",
            femaleRangeText:
              "Below 200 mg/dL (Desirable)\n200-239 mg/dL (Borderline High)\n240 mg/dL and above (High)",
            maleRangeText:
              "Below 200 mg/dL (Desirable)\n200-239 mg/dL (Borderline High)\n240 mg/dL and above (High)",
            unit: "mg/dl",
            displayOrder: 3,
          },
        ],
      },
    ],
  },

  {
    key: "AFP",
    aliases: [
      "AFP",
      "ALPHA FETO PROTEIN",
      "ALPHA FETO-PROTEIN",
      "ALPHA FETO PROTEIN (AFP)",
    ],
    title: "ALPHA Feto-Protein (AFP)",
    sections: [
      {
        sectionName: "",
        displayOrder: 1,
        fields: [
          {
            fieldCode: "36",
            fieldName: "ALPHA Feto-Protein",
            inputType: "NUMBER",
            femaleRangeText: "0.46 - 9.0",
            maleRangeText: "0.46 - 9.0",
            unit: "ng/mL",
            displayOrder: 1,
          },
        ],
      },
    ],
  },

  {
    key: "ASO_TITRE",
    aliases: [
      "ASO",
      "ASO TITRE",
      "ASOT",
      "ASOT TITRE",
    ],
    title: "ASO TITRE",
    sections: [
      {
        sectionName: "",
        displayOrder: 1,
        fields: [
          {
            fieldCode: "91",
            fieldName: "ASOT Titre",
            inputType: "NUMBER",
            femaleRangeText: "Upto: 200",
            maleRangeText: "Upto: 200",
            unit: "IU/ml",
            displayOrder: 1,
          },
        ],
      },
    ],
  },

  {
    key: "MALARIAL_PARASITE",
    aliases: [
      "MP",
      "MALARIAL PARASITE",
      "MALARIAL PARASITE SMEAR",
      "MALARIA PARASITE SMEAR",
    ],
    title: "Malarial Parasite Smear (MP)",
    sections: [
      {
        sectionName: "",
        displayOrder: 1,
        fields: [
          {
            fieldCode: "322",
            fieldName: "Malarial Parasite",
            inputType: "TEXT",
            displayOrder: 1,
          },
        ],
      },
    ],
  },
];