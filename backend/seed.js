const db = require('./database');

const categories = [
  {
    "name": "Sports Infrastructure",
    "sort_order": 1
  },
  {
    "name": "Academic Infrastructure",
    "sort_order": 2
  },
  {
    "name": "General Facilities",
    "sort_order": 3
  },
  {
    "name": "Visual & Performing Arts Infra",
    "sort_order": 4
  },
  {
    "name": "STEM Infra",
    "sort_order": 5
  }
];

const offeringsByCategory = {
  "Sports Infrastructure": [
    "Football Ground",
    "Cricket Ground",
    "Basketball Court",
    "Indoor Sports Area",
    "Swimming Pool"
  ],
  "Academic Infrastructure": [
    "Digital Classrooms",
    "Science Lab",
    "Math Lab",
    "Language Lab",
    "Chemistry Lab",
    "Physics Lab",
    "Bio Lab"
  ],
  "General Facilities": [
    "Library/Reading Room",
    "Auditorium / Multipurpose Hall",
    "Play Area (Pre-Primary)"
  ],
  "Visual & Performing Arts Infra": [
    "Art & Craft Room",
    "PA - Music Room",
    "PA - Dance Studio",
    "PA - Theatre / Drama Room",
    "Pottery Studio/Textile"
  ],
  "STEM Infra": [
    "Coding Lab/Robotics Lab",
    "DIY / Maker Lab",
    "Horticulture Lab / Garden",
    "Astronomy Lab / Sky Observation Area"
  ]
};

const schools = [
  {
    "name": "OIS Dindigul",
    "code": "OIS-DGL",
    "city": "Dindigul",
    "state": "Tamil Nadu",
    "acquired_date": "2020-06-01",
    "status": "active"
  },
  {
    "name": "OIS Kelambakkam",
    "code": "OIS-KLB",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "acquired_date": "2021-03-15",
    "status": "active"
  },
  {
    "name": "OIS Oragadam",
    "code": "OIS-OGD",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "acquired_date": "2022-01-10",
    "status": "active"
  },
  {
    "name": "OIS Thirumudivakkam-Hold",
    "code": "OIS-TMV",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "acquired_date": null,
    "status": "inactive"
  },
  {
    "name": "OIS Tattva",
    "code": "OIS-TVA",
    "city": "Bengaluru",
    "state": "Karnataka",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OIS VELS Marathalli",
    "code": "OIS-VML",
    "city": "Bengaluru",
    "state": "Karnataka",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OIS HSR",
    "code": "OIS-HSR",
    "city": "Bengaluru",
    "state": "Karnataka",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OIS Arkere",
    "code": "OIS-ARK",
    "city": "Bengaluru",
    "state": "Karnataka",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OIS Rayasandara",
    "code": "OIS-RYS",
    "city": "Bengaluru",
    "state": "Karnataka",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OIS Mahadevpura",
    "code": "OIS-MDP",
    "city": "Bengaluru",
    "state": "Karnataka",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OIS Perungudi-New building",
    "code": "OIS-PRG",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OIS Vandalur-New building",
    "code": "OIS-VDL",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OIS Coimbatore-New building",
    "code": "OIS-CBE",
    "city": "Coimbatore",
    "state": "Tamil Nadu",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OIS Hesarghatta",
    "code": "OIS-HSG",
    "city": "Bengaluru",
    "state": "Karnataka",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OIS Yelahanka New Town-New building",
    "code": "OIS-YNT",
    "city": "Bengaluru",
    "state": "Karnataka",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OIS Kuntaloor-New building",
    "code": "OIS-KNT",
    "city": "Bengaluru",
    "state": "Karnataka",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OIS Manneguda-New building",
    "code": "OIS-MNG",
    "city": "Hyderabad",
    "state": "Telangana",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OIS Ramamurthynagar",
    "code": "OIS-RMN",
    "city": "Bengaluru",
    "state": "Karnataka",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OIS Mahbubnagar-New building",
    "code": "OIS-MBN",
    "city": "Mahbubnagar",
    "state": "Telangana",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OCSE Dharwad",
    "code": "OCSE-DWD",
    "city": "Dharwad",
    "state": "Karnataka",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OIS Hubli-New building",
    "code": "OIS-HBL",
    "city": "Hubli",
    "state": "Karnataka",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OIS Cheemasandara-New building",
    "code": "OIS-CMS",
    "city": "Bengaluru",
    "state": "Karnataka",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OIS Bhopal-New building",
    "code": "OIS-BPL",
    "city": "Bhopal",
    "state": "Madhya Pradesh",
    "acquired_date": null,
    "status": "active"
  },
  {
    "name": "OIS Nagpur",
    "code": "OIS-NGP",
    "city": "Nagpur",
    "state": "Maharashtra",
    "acquired_date": null,
    "status": "active"
  }
];

const offeringData = {
  "OIS-DGL": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Cricket Ground": {
      "status": "No",
      "condition_notes": ""
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Indoor Sports Area": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Swimming Pool": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": "Need panels"
    },
    "Science Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Math Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Language Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Chemistry Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Physics Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Bio Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Art & Craft Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Pottery Studio/Textile": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "DIY / Maker Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Horticulture Lab / Garden": {
      "status": "Yes",
      "condition_notes": "Open ground"
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-KLB": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Cricket Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Indoor Sports Area": {
      "status": "No",
      "condition_notes": ""
    },
    "Swimming Pool": {
      "status": "No",
      "condition_notes": ""
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Math Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Language Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Chemistry Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Physics Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Bio Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Art & Craft Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Pottery Studio/Textile": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "DIY / Maker Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Horticulture Lab / Garden": {
      "status": "Yes",
      "condition_notes": "Open Ground"
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-OGD": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Cricket Ground": {
      "status": "No",
      "condition_notes": ""
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Indoor Sports Area": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Swimming Pool": {
      "status": "No",
      "condition_notes": ""
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Math Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Language Lab": {
      "status": "In Future",
      "condition_notes": ""
    },
    "Chemistry Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Physics Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Bio Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "No",
      "condition_notes": ""
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Art & Craft Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Pottery Studio/Textile": {
      "status": "No",
      "condition_notes": ""
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "DIY / Maker Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Horticulture Lab / Garden": {
      "status": "Yes",
      "condition_notes": "Open"
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-TMV": {
    "Football Ground": {
      "status": "No",
      "condition_notes": ""
    },
    "Cricket Ground": {
      "status": "No",
      "condition_notes": ""
    },
    "Basketball Court": {
      "status": "No",
      "condition_notes": ""
    },
    "Indoor Sports Area": {
      "status": "No",
      "condition_notes": ""
    },
    "Swimming Pool": {
      "status": "No",
      "condition_notes": ""
    },
    "Digital Classrooms": {
      "status": "No",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Math Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Language Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "No",
      "condition_notes": ""
    },
    "Auditorium / Multipurpose Hall": {
      "status": "No",
      "condition_notes": ""
    },
    "Play Area (Pre-Primary)": {
      "status": "No",
      "condition_notes": ""
    },
    "Art & Craft Room": {
      "status": "No",
      "condition_notes": ""
    },
    "PA - Music Room": {
      "status": "No",
      "condition_notes": ""
    },
    "PA - Dance Studio": {
      "status": "No",
      "condition_notes": ""
    },
    "PA - Theatre / Drama Room": {
      "status": "No",
      "condition_notes": ""
    },
    "Pottery Studio/Textile": {
      "status": "No",
      "condition_notes": ""
    },
    "Coding Lab/Robotics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "DIY / Maker Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Horticulture Lab / Garden": {
      "status": "No",
      "condition_notes": ""
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-TVA": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Cricket Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Indoor Sports Area": {
      "status": "No",
      "condition_notes": ""
    },
    "Swimming Pool": {
      "status": "Yes",
      "condition_notes": "Space needs to build"
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Math Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Language Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Chemistry Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Physics Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Bio Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Art & Craft Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Pottery Studio/Textile": {
      "status": "In Future",
      "condition_notes": ""
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "DIY / Maker Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Horticulture Lab / Garden": {
      "status": "Yes",
      "condition_notes": "Open Ground"
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-VML": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space isavailable need to build"
    },
    "Cricket Ground": {
      "status": "No",
      "condition_notes": ""
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Indoor Sports Area": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Swimming Pool": {
      "status": "Yes",
      "condition_notes": "Space is available need to build"
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Science Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Math Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Language Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "Yes",
      "condition_notes": "Open ground"
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Art & Craft Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Pottery Studio/Textile": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "DIY / Maker Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Horticulture Lab / Garden": {
      "status": "Yes",
      "condition_notes": "Open Ground"
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-HSR": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Cricket Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Indoor Sports Area": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Swimming Pool": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Math Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Language Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "Yes",
      "condition_notes": "Open ground"
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Art & Craft Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Pottery Studio/Textile": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "DIY / Maker Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Horticulture Lab / Garden": {
      "status": "In Future",
      "condition_notes": ""
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-ARK": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space is available, need to build"
    },
    "Cricket Ground": {
      "status": "No",
      "condition_notes": ""
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space is available, need to build"
    },
    "Indoor Sports Area": {
      "status": "No",
      "condition_notes": ""
    },
    "Swimming Pool": {
      "status": "No",
      "condition_notes": ""
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Math Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Language Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "No",
      "condition_notes": ""
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Art & Craft Room": {
      "status": "No",
      "condition_notes": ""
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Pottery Studio/Textile": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space is available, need to build"
    },
    "DIY / Maker Lab": {
      "status": "Yes",
      "condition_notes": "Space is available, need to build"
    },
    "Horticulture Lab / Garden": {
      "status": "No",
      "condition_notes": "Space is available, need to build"
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-RYS": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Cricket Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Indoor Sports Area": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Swimming Pool": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Math Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Language Lab": {
      "status": "In Future",
      "condition_notes": ""
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "Yes",
      "condition_notes": "Open Ground"
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Art & Craft Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Pottery Studio/Textile": {
      "status": "No",
      "condition_notes": ""
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "DIY / Maker Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Horticulture Lab / Garden": {
      "status": "Yes",
      "condition_notes": "Open Ground"
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-MDP": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space is available , need to build"
    },
    "Cricket Ground": {
      "status": "No",
      "condition_notes": ""
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space is available , need to build"
    },
    "Indoor Sports Area": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Swimming Pool": {
      "status": "Yes",
      "condition_notes": "Space is available , need to build"
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Math Lab": {
      "status": "Yes",
      "condition_notes": "Room is vaialble, need to renovate"
    },
    "Language Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Art & Craft Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Pottery Studio/Textile": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "DIY / Maker Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Horticulture Lab / Garden": {
      "status": "Yes",
      "condition_notes": "Open Ground"
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-PRG": {
    "Football Ground": {
      "status": "No",
      "condition_notes": ""
    },
    "Cricket Ground": {
      "status": "No",
      "condition_notes": ""
    },
    "Basketball Court": {
      "status": "No",
      "condition_notes": ""
    },
    "Indoor Sports Area": {
      "status": "No",
      "condition_notes": ""
    },
    "Swimming Pool": {
      "status": "No",
      "condition_notes": ""
    },
    "Digital Classrooms": {
      "status": "No",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Math Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Language Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "No",
      "condition_notes": ""
    },
    "Auditorium / Multipurpose Hall": {
      "status": "No",
      "condition_notes": ""
    },
    "Play Area (Pre-Primary)": {
      "status": "No",
      "condition_notes": ""
    },
    "Art & Craft Room": {
      "status": "No",
      "condition_notes": ""
    },
    "PA - Music Room": {
      "status": "No",
      "condition_notes": ""
    },
    "PA - Dance Studio": {
      "status": "No",
      "condition_notes": ""
    },
    "PA - Theatre / Drama Room": {
      "status": "No",
      "condition_notes": ""
    },
    "Pottery Studio/Textile": {
      "status": "No",
      "condition_notes": ""
    },
    "Coding Lab/Robotics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "DIY / Maker Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Horticulture Lab / Garden": {
      "status": "No",
      "condition_notes": ""
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-VDL": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Cricket Ground": {
      "status": "No",
      "condition_notes": ""
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Indoor Sports Area": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Swimming Pool": {
      "status": "In Future",
      "condition_notes": ""
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Math Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Language Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "Yes",
      "condition_notes": "Open ground"
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Art & Craft Room": {
      "status": "No",
      "condition_notes": ""
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Pottery Studio/Textile": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "DIY / Maker Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Horticulture Lab / Garden": {
      "status": "Yes",
      "condition_notes": "Open Ground"
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-CBE": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Cricket Ground": {
      "status": "No",
      "condition_notes": ""
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Indoor Sports Area": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Swimming Pool": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Math Lab": {
      "status": "In Future",
      "condition_notes": ""
    },
    "Language Lab": {
      "status": "In Future",
      "condition_notes": ""
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Art & Craft Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Pottery Studio/Textile": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "DIY / Maker Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Horticulture Lab / Garden": {
      "status": "Yes",
      "condition_notes": "Open Ground"
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-HSG": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Cricket Ground": {
      "status": "No",
      "condition_notes": ""
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Indoor Sports Area": {
      "status": "Yes",
      "condition_notes": "Auditorium room will be used"
    },
    "Swimming Pool": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Math Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Language Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space is available, already renovated"
    },
    "Art & Craft Room": {
      "status": "No",
      "condition_notes": ""
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space is available, already renovated"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space is available, already renovated"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": "Space is available, already renovated"
    },
    "Pottery Studio/Textile": {
      "status": "No",
      "condition_notes": ""
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space is available, already renovated"
    },
    "DIY / Maker Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Horticulture Lab / Garden": {
      "status": "No",
      "condition_notes": ""
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-YNT": {
    "Football Ground": {
      "status": "No",
      "condition_notes": ""
    },
    "Cricket Ground": {
      "status": "No",
      "condition_notes": ""
    },
    "Basketball Court": {
      "status": "No",
      "condition_notes": ""
    },
    "Indoor Sports Area": {
      "status": "No",
      "condition_notes": ""
    },
    "Swimming Pool": {
      "status": "No",
      "condition_notes": ""
    },
    "Digital Classrooms": {
      "status": "No",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Math Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Language Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "No",
      "condition_notes": ""
    },
    "Auditorium / Multipurpose Hall": {
      "status": "No",
      "condition_notes": ""
    },
    "Play Area (Pre-Primary)": {
      "status": "No",
      "condition_notes": ""
    },
    "Art & Craft Room": {
      "status": "No",
      "condition_notes": ""
    },
    "PA - Music Room": {
      "status": "No",
      "condition_notes": ""
    },
    "PA - Dance Studio": {
      "status": "No",
      "condition_notes": ""
    },
    "PA - Theatre / Drama Room": {
      "status": "No",
      "condition_notes": ""
    },
    "Pottery Studio/Textile": {
      "status": "No",
      "condition_notes": ""
    },
    "Coding Lab/Robotics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "DIY / Maker Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Horticulture Lab / Garden": {
      "status": "No",
      "condition_notes": ""
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-KNT": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Cricket Ground": {
      "status": "Yes",
      "condition_notes": "Net Practice"
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Indoor Sports Area": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Swimming Pool": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Math Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Language Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "No",
      "condition_notes": ""
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Art & Craft Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Pottery Studio/Textile": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "DIY / Maker Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Horticulture Lab / Garden": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-MNG": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Cricket Ground": {
      "status": "Yes",
      "condition_notes": "Net Practice"
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Indoor Sports Area": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Swimming Pool": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Math Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Language Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "No",
      "condition_notes": ""
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Art & Craft Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Pottery Studio/Textile": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "DIY / Maker Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Horticulture Lab / Garden": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-RMN": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Cricket Ground": {
      "status": "No",
      "condition_notes": ""
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Indoor Sports Area": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Swimming Pool": {
      "status": "No",
      "condition_notes": ""
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Math Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Language Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "Yes",
      "condition_notes": "Open Ground"
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Art & Craft Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Pottery Studio/Textile": {
      "status": "No",
      "condition_notes": ""
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "DIY / Maker Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Horticulture Lab / Garden": {
      "status": "In Future",
      "condition_notes": ""
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-MBN": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Cricket Ground": {
      "status": "Yes",
      "condition_notes": "Net Practice"
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Indoor Sports Area": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Swimming Pool": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Math Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Language Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "No",
      "condition_notes": ""
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Art & Craft Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Pottery Studio/Textile": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "DIY / Maker Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Horticulture Lab / Garden": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OCSE-DWD": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Cricket Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Indoor Sports Area": {
      "status": "No",
      "condition_notes": ""
    },
    "Swimming Pool": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": "Only Projectors"
    },
    "Science Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Math Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Language Lab": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "Yes",
      "condition_notes": "Open Ground"
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Art & Craft Room": {
      "status": "Yes",
      "condition_notes": "Same class room"
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": ""
    },
    "Pottery Studio/Textile": {
      "status": "No",
      "condition_notes": ""
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "DIY / Maker Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Horticulture Lab / Garden": {
      "status": "Yes",
      "condition_notes": "Open field"
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-HBL": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Cricket Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Indoor Sports Area": {
      "status": "No",
      "condition_notes": ""
    },
    "Swimming Pool": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": "Projector"
    },
    "Science Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Math Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Language Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "Yes",
      "condition_notes": "Open ground"
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Art & Craft Room": {
      "status": "Yes",
      "condition_notes": "Same class room"
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": ""
    },
    "Pottery Studio/Textile": {
      "status": "No",
      "condition_notes": ""
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "DIY / Maker Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Horticulture Lab / Garden": {
      "status": "Yes",
      "condition_notes": "Open Field"
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-CMS": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Cricket Ground": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Indoor Sports Area": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Swimming Pool": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Digital Classrooms": {
      "status": "Yes",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Math Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Language Lab": {
      "status": "In Future",
      "condition_notes": ""
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "Yes",
      "condition_notes": "Open Ground"
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Art & Craft Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Pottery Studio/Textile": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "DIY / Maker Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Horticulture Lab / Garden": {
      "status": "In Future",
      "condition_notes": ""
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-BPL": {
    "Football Ground": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Cricket Ground": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Basketball Court": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "Indoor Sports Area": {
      "status": "No",
      "condition_notes": ""
    },
    "Swimming Pool": {
      "status": "Yes",
      "condition_notes": "Space is available in direct use condition"
    },
    "Digital Classrooms": {
      "status": "No",
      "condition_notes": "Projector"
    },
    "Science Lab": {
      "status": "In Future",
      "condition_notes": ""
    },
    "Math Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Language Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "Yes",
      "condition_notes": "Room is vaialbale"
    },
    "Auditorium / Multipurpose Hall": {
      "status": "Yes",
      "condition_notes": "Open Ground"
    },
    "Play Area (Pre-Primary)": {
      "status": "Yes",
      "condition_notes": "Space needs to build"
    },
    "Art & Craft Room": {
      "status": "Yes",
      "condition_notes": "No lab is required"
    },
    "PA - Music Room": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Dance Studio": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "PA - Theatre / Drama Room": {
      "status": "Yes",
      "condition_notes": ""
    },
    "Pottery Studio/Textile": {
      "status": "No",
      "condition_notes": ""
    },
    "Coding Lab/Robotics Lab": {
      "status": "Yes",
      "condition_notes": "Space has to renovate"
    },
    "DIY / Maker Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Horticulture Lab / Garden": {
      "status": "No",
      "condition_notes": ""
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  },
  "OIS-NGP": {
    "Football Ground": {
      "status": "No",
      "condition_notes": ""
    },
    "Cricket Ground": {
      "status": "No",
      "condition_notes": ""
    },
    "Basketball Court": {
      "status": "No",
      "condition_notes": ""
    },
    "Indoor Sports Area": {
      "status": "No",
      "condition_notes": ""
    },
    "Swimming Pool": {
      "status": "No",
      "condition_notes": ""
    },
    "Digital Classrooms": {
      "status": "No",
      "condition_notes": ""
    },
    "Science Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Math Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Language Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Chemistry Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Physics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Bio Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Library/Reading Room": {
      "status": "No",
      "condition_notes": ""
    },
    "Auditorium / Multipurpose Hall": {
      "status": "No",
      "condition_notes": ""
    },
    "Play Area (Pre-Primary)": {
      "status": "No",
      "condition_notes": ""
    },
    "Art & Craft Room": {
      "status": "No",
      "condition_notes": ""
    },
    "PA - Music Room": {
      "status": "No",
      "condition_notes": ""
    },
    "PA - Dance Studio": {
      "status": "No",
      "condition_notes": ""
    },
    "PA - Theatre / Drama Room": {
      "status": "No",
      "condition_notes": ""
    },
    "Pottery Studio/Textile": {
      "status": "No",
      "condition_notes": ""
    },
    "Coding Lab/Robotics Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "DIY / Maker Lab": {
      "status": "No",
      "condition_notes": ""
    },
    "Horticulture Lab / Garden": {
      "status": "No",
      "condition_notes": ""
    },
    "Astronomy Lab / Sky Observation Area": {
      "status": "No",
      "condition_notes": ""
    }
  }
};

function seed() {
  const insertCategory = db.prepare(`INSERT OR IGNORE INTO categories (name, sort_order) VALUES (?, ?)`);
  const insertOffering = db.prepare(`INSERT OR IGNORE INTO offerings (category_id, name, sort_order) VALUES (?, ?, ?)`);
  const insertSchool = db.prepare(`INSERT OR IGNORE INTO schools (name, code, location, city, state, acquired_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const insertOffStatus = db.prepare(`
    INSERT OR REPLACE INTO school_offerings (school_id, offering_id, status, condition_notes)
    VALUES (?, ?, ?, ?)
  `);

  const seedAll = db.transaction(() => {
    for (const cat of categories) {
      insertCategory.run(cat.name, cat.sort_order);
    }

    for (const [catName, offs] of Object.entries(offeringsByCategory)) {
      const cat = db.prepare('SELECT id FROM categories WHERE name = ?').get(catName);
      offs.forEach((name, i) => insertOffering.run(cat.id, name, i + 1));
    }

    for (const school of schools) {
      insertSchool.run(school.name, school.code, school.city || '', school.city || '', school.state || '', school.acquired_date || null, school.status || 'active');
    }

    for (const [schoolCode, offerings] of Object.entries(offeringData)) {
      const school = db.prepare('SELECT id FROM schools WHERE code = ?').get(schoolCode);
      for (const [offeringName, data] of Object.entries(offerings)) {
        const offering = db.prepare('SELECT id FROM offerings WHERE name = ?').get(offeringName);
        if (school && offering) {
          insertOffStatus.run(school.id, offering.id, data.status, data.condition_notes);
        }
      }
    }
  });

  seedAll();
  console.log('Database seeded successfully with', Object.keys(offeringData).length, 'schools and', 24, 'offerings.');
}

seed();
