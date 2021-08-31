const { readdirSync } = require('fs')
const schools = require('../systems/data/schools.json')

// get all system directories (except excluded ones)
const excludedDirectories = ['data']
const systems = readdirSync('./systems', { withFileTypes: true }).filter(entry => entry.isDirectory() && !excludedDirectories.includes(entry.name)).map(dir => dir.name)

const mockData = {
  ad: {
    company: 'Nøtterøy videregående skole',
    department: 'Nøtterøy vgs studiespesialisering språkfaglig avdeling',
    displayName: 'Dyktig Tusenfryd',
    distinguishedName: 'CN=dyk1212,OU=AUTO USERS,OU=USERS,OU=VTFK,DC=login,DC=top,DC=no',
    employeeNumber: '12128015478',
    enabled: true,
    extensionAttribute6: 'OF-NTV-SP-SPRAK',
    givenName: 'Dyktig',
    lockedOut: false,
    mail: 'dyktig.tusenfryd@vtfk.no',
    name: 'dyk1212',
    proxyAddresses: ['smtp:dyktig.lilleputtland@vfk.no', 'sip:dyktig.tusenfryd@vtfk.no', 'SMTP:dyktig.tusenfryd@vtfk.no'],
    pwdLastSet: '2019-11-18T14:18:10.4794903+00:00',
    samAccountName: 'dyk1212',
    sn: 'Tusenfryd',
    state: 'OF-FRV',
    userPrincipalName: 'dyktig.tusenfryd@vtfk.no',
    whenChanged: '2021-03-11T22:43:22+00:00',
    whenCreated: '2019-02-12T19:51:31+00:00'
  },
  feide: {
    displayName: 'Dyktig Tusenfryd',
    distinguishedName: 'CN=dyk1212,OU=People,OU=Feide,DC=vtfk,DC=no',
    eduPersonAffiliation: ['member', 'faculty', 'employee'],
    eduPersonEntitlement: ['urn:mace:feide.no:go:groupid:u:NO974575086:3pbb%2F201nor1233:2020-08-01:2021-07-31', 'urn:mace:feide.no:go:groupid:u:NO974575086:3pbb%2F201nor1232:2020-08-01:2021-07-31', 'urn:mace:feide.no:go:groupid:u:NO974575086:3pbb%2F201nor1231:2020-08-01:2021-07-31', 'urn:mace:feide.no:go:group:u:NOR1233:NO974575086:3PBB%2F201NOR1233:2020-08-01:2021-07-31:faculty:FRVS%3A3PBB%2F201NOR1233', 'urn:mace:feide.no:go:group:u:NOR1232:NO974575086:3PBB%2F201NOR1232:2020-08-01:2021-07-31:faculty:FRVS%3A3PBB%2F201NOR1232', 'urn:mace:feide.no:go:group:u:NOR1231:NO974575086:3PBB%2F201NOR1231:2020-08-01:2021-07-31:faculty:FRVS%3A3PBB%2F201NOR1231', 'urn:mace:feide.no:go:grep:uuid:c473400d-5c2c-46ca-9008-26e66ed9e3bd', 'urn:mace:feide.no:go:grep:uuid:6f339880-4d42-497f-8d9a-470d78c50159', 'urn:mace:feide.no:go:grep:uuid:4de3e155-1c19-4e60-bf33-1f79faa7a531', 'urn:mace:feide.no:go:groupid:u:NO974575086:2kla%2F201nor1206:2020-08-01:2021-07-31', 'urn:mace:feide.no:go:groupid:u:NO974575086:2byb%2F201nor1206:2020-08-01:2021-07-31', 'urn:mace:feide.no:go:group:u:NOR1206:NO974575086:2KLA%2F201NOR1206:2020-08-01:2021-07-31:faculty:FRVS%3A2KLA%2F201NOR1206', 'urn:mace:feide.no:go:group:u:NOR1206:NO974575086:2BYB%2F201NOR1206:2020-08-01:2021-07-31:faculty:FRVS%3A2BYB%2F201NOR1206', 'urn:mace:feide.no:go:grep:uuid:b1342231-da91-43b6-a7af-f588bd129de2', 'urn:mace:feide.no:go:groupid:u:NO974575000:2ste%2F201nor1210:2020-08-01:2021-07-31', 'urn:mace:feide.no:go:groupid:u:NO974575000:2hos%2F201nor1210:2020-08-01:2021-07-31', 'urn:mace:feide.no:go:group:u:NOR1210:NO974575000:2STE%2F201NOR1210:2020-08-01:2021-07-31:faculty:NVS%3A2STE%2F201NOR1210', 'urn:mace:feide.no:go:group:u:NOR1210:NO974575000:2HOS%2F201NOR1210:2020-08-01:2021-07-31:faculty:NVS%3A2HOS%2F201NOR1210', 'urn:mace:feide.no:go:grep:uuid:b31e57c1-15ed-4155-8fa3-c4297b131228', 'urn:mace:feide.no:go:groupid:u:NO974575000:2ste%2Fnor1208:2020-08-01:2021-07-31', 'urn:mace:feide.no:go:groupid:u:NO974575000:2hos%2Fnor1208:2020-08-01:2021-07-31', 'urn:mace:feide.no:go:groupid:u:NO974575000:1hoa%2Fyff4106:2020-08-01:2021-07-31', 'urn:mace:feide.no:go:group:u:YFF4106:NO974575000:1HOA%2FYFF4106:2020-08-01:2021-07-31:faculty:NVS%3A1HOA%2FYFF4106', 'urn:mace:feide.no:go:group:u:NOR1208:NO974575000:2STE%2FNOR1208:2020-08-01:2021-07-31:faculty:NVS%3A2STE%2FNOR1208', 'urn:mace:feide.no:go:group:u:NOR1208:NO974575000:2HOS%2FNOR1208:2020-08-01:2021-07-31:faculty:NVS%3A2HOS%2FNOR1208', 'urn:mace:feide.no:go:grep:uuid:2400fb87-2561-4938-9836-8dda533981aa', 'urn:mace:feide.no:go:grep:uuid:e463741c-3d0e-432d-8da6-39fc5bd974dc', 'urn:mace:feide.no:go:groupid:b:NO974575000:2ste:2020-08-01:2021-07-31', 'urn:mace:feide.no:go:group:b::NO974575000:2STE:2020-08-01:2021-07-31:faculty:NVS%3A2STE'],
    eduPersonOrgDN: 'O=Vestfold og Telemark fylkeskommune,DC=vtfk,DC=no',
    eduPersonOrgUnitDN: ['OU=Færder videregående skole,OU=Units,OU=Feide,DC=vtfk,DC=no', 'OU=Nøtterøy videregående skole,OU=Units,OU=Feide,DC=vtfk,DC=no'],
    eduPersonPrincipalName: 'dyk1212@vtfk.no',
    enabled: true,
    givenName: 'Dyktig',
    lastLogonDate: '2021-03-18T09:47:48.2490855+00:00',
    lockedOut: false,
    mail: 'dyktig.tusenfryd@vtfk.no',
    name: 'dyk1212',
    norEduPersonAuthnMethod: ['urn:mace:feide.no:auth:method:ga ladøbøjdadfbhølkdafhbvjkdabjvldafbkjdaf.kfd.jadfjad.fkadfjvlj.afvbjsd.jkvbsd.vsadblvbasvb.sbv.jksbv.jbvjb.vjkb.kv.kfjb.j<fjksdbv.b<s.jvkb.jvb<.-jv-<dlfv<x label=Authenticator%20(Feide)'],
    norEduPersonNIN: '12128015478',
    passwordLastSet: '2019-11-18T14:18:10.6601414+00:00',
    surname: 'Tusenfryd',
    uid: ['dyk1212'],
    whenChanged: '2021-03-18T09:47:48+00:00',
    whenCreated: '2019-03-15T07:46:11+00:00'
  },
  vis: {
    person: {
      navn: {
        fornavn: 'Dyktig',
        mellomnavn: null,
        etternavn: 'Tusenfryd'
      },
      kontaktinformasjon: {
        epostadresse: null,
        mobiltelefonnummer: '12345678',
        telefonnummer: '12345678'
      },
      fodselsdato: '1980-12-12T00:00:00Z',
      fodselsnummer: {
        identifikatorverdi: '12128015478'
      },
      kjonn: {
        kode: '2'
      },
      bostedsadresse: {
        adresselinje: [
          'Veien 78611'
        ],
        postnummer: '9999',
        poststed: 'BORDPLATE'
      },
      elev: {
        elevforhold: [
          {
            skole: {
              navn: 'Sandefjord videregående skole'
            },
            gyldighetsperiode: {
              start: '2021-08-01T00:00:00Z',
              slutt: '2022-07-31T00:00:00Z'
            },
            basisgruppe: [
              {
                navn: '1HSC',
                trinn: {
                  navn: 'VG1'
                },
                termin: [
                  {
                    navn: 'T2'
                  },
                  {
                    navn: 'T1'
                  }
                ],
                skolear: {
                  navn: '20212022'
                },
                periode: [
                  {
                    start: '2021-08-01T00:00:00Z',
                    slutt: '2022-07-31T00:00:00Z'
                  }
                ]
              }
            ],
            undervisningsgruppe: [
              {
                navn: '1HSC/NAT1011',
                periode: [
                  {
                    start: '2021-08-01T00:00:00Z',
                    slutt: '2022-07-31T00:00:00Z'
                  }
                ],
                skolear: {
                  navn: '20212022'
                },
                skole: {
                  navn: 'Sandefjord videregående skole'
                }
              },
              {
                navn: 'ØKT-SKAL-BRUKES-TIL-GNO-HO',
                periode: [
                  {
                    start: '2021-08-01T00:00:00Z',
                    slutt: '2022-07-31T00:00:00Z'
                  }
                ],
                skolear: {
                  navn: '20212022'
                },
                skole: {
                  navn: 'Sandefjord videregående skole'
                }
              },
              {
                navn: '1HSB1HSC/KRO1017',
                periode: [
                  {
                    start: '2021-08-01T00:00:00Z',
                    slutt: '2022-07-31T00:00:00Z'
                  }
                ],
                skolear: {
                  navn: '20212022'
                },
                skole: {
                  navn: 'Sandefjord videregående skole'
                }
              },
              {
                navn: '1HSC/HSF1006',
                periode: [
                  {
                    start: '2021-08-01T00:00:00Z',
                    slutt: '2022-07-31T00:00:00Z'
                  }
                ],
                skolear: {
                  navn: '20212022'
                },
                skole: {
                  navn: 'Sandefjord videregående skole'
                }
              },
              {
                navn: '1HSC/MAT1117',
                periode: [
                  {
                    start: '2021-08-01T00:00:00Z',
                    slutt: '2022-07-31T00:00:00Z'
                  }
                ],
                skolear: {
                  navn: '20212022'
                },
                skole: {
                  navn: 'Sandefjord videregående skole'
                }
              },
              {
                navn: '1HSC/HSF1007',
                periode: [
                  {
                    start: '2021-08-01T00:00:00Z',
                    slutt: '2022-07-31T00:00:00Z'
                  }
                ],
                skolear: {
                  navn: '20212022'
                },
                skole: {
                  navn: 'Sandefjord videregående skole'
                }
              },
              {
                navn: '1HSC/HSF1008',
                periode: [
                  {
                    start: '2021-08-01T00:00:00Z',
                    slutt: '2022-07-31T00:00:00Z'
                  }
                ],
                skolear: {
                  navn: '20212022'
                },
                skole: {
                  navn: 'Sandefjord videregående skole'
                }
              },
              {
                navn: '1HSC/ENG1009',
                periode: [
                  {
                    start: '2021-08-01T00:00:00Z',
                    slutt: '2022-07-31T00:00:00Z'
                  }
                ],
                skolear: {
                  navn: '20212022'
                },
                skole: {
                  navn: 'Sandefjord videregående skole'
                }
              },
              {
                navn: '1HSC/YFF4106',
                periode: [
                  {
                    start: '2021-08-01T00:00:00Z',
                    slutt: '2022-07-31T00:00:00Z'
                  }
                ],
                skolear: {
                  navn: '20212022'
                },
                skole: {
                  navn: 'Sandefjord videregående skole'
                }
              }
            ],
            kontaktlarergruppe: [
              {
                navn: '1HSC',
                undervisningsforhold: [
                  {
                    skoleressurs: {
                      person: {
                        fodselsnummer: {
                          identifikatorverdi: '12128015478'
                        },
                        navn: {
                          fornavn: 'Barbro',
                          mellomnavn: '',
                          etternavn: 'Løkesen'
                        },
                        kontaktinformasjon: {
                          epostadresse: 'barbro.lokesen@vtfk.no',
                          mobiltelefonnummer: null,
                          telefonnummer: null
                        }
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      personalressurs: {
        ansettelsesperiode: {
          start: '2009-02-16T00:00:00Z',
          slutt: null
        },
        arbeidsforhold: [
          {
            stillingstittel: 'Sensor',
            ansettelsesprosent: 0,
            gyldighetsperiode: {
              start: '2020-01-01T00:00:00Z',
              slutt: '2020-08-31T23:59:59Z'
            },
            undervisningsforhold: [
              {
                navn: '3STG/HIS1002',
                periode: [
                  {
                    start: '2020-08-17T00:00:00Z',
                    slutt: '2021-06-18T00:00:00Z'
                  }
                ],
                skolear: {
                  navn: '20202021'
                },
                skole: {
                  navn: 'Porsgrunn videregående skole'
                }
              },
              {
                navn: '3STG/NOR1211',
                periode: [
                  {
                    start: '2020-08-17T00:00:00Z',
                    slutt: '2021-06-18T00:00:00Z'
                  }
                ],
                skolear: {
                  navn: '20202021'
                },
                skole: {
                  navn: 'Porsgrunn videregående skole'
                }
              },
              {
                navn: '3STG/KRO1006',
                periode: [
                  {
                    start: '2020-08-17T00:00:00Z',
                    slutt: '2021-06-18T00:00:00Z'
                  }
                ],
                skolear: {
                  navn: '20202021'
                },
                skole: {
                  navn: 'Porsgrunn videregående skole'
                }
              }
            ]
          },
          {
            stillingstittel: 'Adjunkt',
            ansettelsesprosent: 10000,
            gyldighetsperiode: {
              start: '2020-09-01T00:00:00Z',
              slutt: null
            },
            undervisningsforhold: [
              {
                navn: '3STG/HIS1002',
                periode: [
                  {
                    start: '2020-08-17T00:00:00Z',
                    slutt: '2021-06-18T00:00:00Z'
                  }
                ],
                skolear: {
                  navn: '20202021'
                },
                skole: {
                  navn: 'Porsgrunn videregående skole'
                }
              },
              {
                navn: '3STG/NOR1211',
                periode: [
                  {
                    start: '2020-08-17T00:00:00Z',
                    slutt: '2021-06-18T00:00:00Z'
                  }
                ],
                skolear: {
                  navn: '20202021'
                },
                skole: {
                  navn: 'Porsgrunn videregående skole'
                }
              },
              {
                navn: '3STG/KRO1006',
                periode: [
                  {
                    start: '2020-08-17T00:00:00Z',
                    slutt: '2021-06-18T00:00:00Z'
                  }
                ],
                skolear: {
                  navn: '20202021'
                },
                skole: {
                  navn: 'Porsgrunn videregående skole'
                }
              }
            ]
          },
          {
            stillingstittel: 'Sensor',
            ansettelsesprosent: 0,
            gyldighetsperiode: {
              start: '2020-09-01T00:00:00Z',
              slutt: null
            },
            undervisningsforhold: [
              {
                navn: '3STG/HIS1002',
                periode: [
                  {
                    start: '2020-08-17T00:00:00Z',
                    slutt: '2021-06-18T00:00:00Z'
                  }
                ],
                skolear: {
                  navn: '20202021'
                },
                skole: {
                  navn: 'Porsgrunn videregående skole'
                }
              },
              {
                navn: '3STG/NOR1211',
                periode: [
                  {
                    start: '2020-08-17T00:00:00Z',
                    slutt: '2021-06-18T00:00:00Z'
                  }
                ],
                skolear: {
                  navn: '20202021'
                },
                skole: {
                  navn: 'Porsgrunn videregående skole'
                }
              },
              {
                navn: '3STG/KRO1006',
                periode: [
                  {
                    start: '2020-08-17T00:00:00Z',
                    slutt: '2021-06-18T00:00:00Z'
                  }
                ],
                skolear: {
                  navn: '20202021'
                },
                skole: {
                  navn: 'Porsgrunn videregående skole'
                }
              }
            ]
          }
        ]
      }
    }
  },
  sds: [
    {
      person: {
        schoolId: 'FVS',
        schoolIdVariants: ['FVS', 'FRVS'],
        userPrincipalName: 'dyktig.tusenfryd@vtfk.no',
        type: 'Teacher',
        samAccountName: 'dyk1212'
      },
      enrollments: [
        {
          sectionId: '2021-FRVS-2BYB-201NOR1206',
          schoolId: 'FVS',
          sectionCourseDescription: 'Undervisningsgruppa 2BYB/201NOR1206 i Norsk ved Færder videregående skole',
          sectionName: 'OF-FRV-2BYB-Norsk'
        },
        {
          sectionId: '2021-FRVS-2KLA-201NOR1206',
          schoolId: 'FVS',
          sectionCourseDescription: 'Undervisningsgruppa 2KLA/201NOR1206 i Norsk ved Færder videregående skole',
          sectionName: 'OF-FRV-2KLA-Norsk'
        },
        {
          sectionId: '2021-FRVS-3PBB-201NOR1231',
          schoolId: 'FVS',
          sectionCourseDescription: 'Undervisningsgruppa 3PBB/201NOR1231 i Norsk ved Færder videregående skole',
          sectionName: 'OF-FRV-3PBB-Norsk'
        }
      ]
    },
    {
      person: {
        schoolId: 'NVS',
        schoolIdVariants: ['NVS'],
        userPrincipalName: 'dyktig.tusenfryd@vtfk.no',
        type: 'Teacher',
        samAccountName: 'dyk1212'
      },
      enrollments: [
        {
          sectionId: '2021-NVS-1HOA-YFF4106',
          schoolId: 'NVS',
          sectionCourseDescription: 'Undervisningsgruppa 1HOA/YFF4106 i Yrkesfaglig fordypning Vg1 ved Nøtterøy videregående skole',
          sectionName: 'OF-NTV-1HOA-Yrkesfaglig fordypning Vg1'
        },
        {
          sectionId: '2021-NVS-2HOS-201NOR1210',
          schoolId: 'NVS',
          sectionCourseDescription: 'Undervisningsgruppa 2HOS/201NOR1210 i Norsk ved Nøtterøy videregående skole',
          sectionName: 'OF-NTV-2HOS-Norsk'
        },
        {
          sectionId: '2021-NVS-2STE',
          schoolId: 'NVS',
          sectionCourseDescription: 'Basisgruppe 2STE ved Nøtterøy videregående skole',
          sectionName: 'OF-NTV-2STE-Klasse'
        },
        {
          sectionId: '2021-NVS-2STE-201NOR1210',
          schoolId: 'NVS',
          sectionCourseDescription: 'Undervisningsgruppa 2STE/201NOR1210 i Norsk ved Nøtterøy videregående skole',
          sectionName: 'OF-NTV-2STE-Norsk'
        }
      ]
    }
  ],
  sync: {
    vigobas: {
      lastRunTime: '2021-06-18T02:35:03.0852857+00:00'
    },
    aadSync: {
      lastAzureADSyncTime: '2021-06-18T20:00:00Z'
    },
    sdsSync: {
      lastSdsSyncTime: '2021-06-18T02:35:03.0852857+00:00'
    }
  },
  visma: {
    '@personIdHRM': '12345',
    '@xsi:noNamespaceSchemaLocation': 'http://vsm01/hrm_ws/schemas/person/enterprisePersonExport.xsd',
    '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    authentication: {
      initials: 'DYK1212',
      userId: '12345',
      username: 'TUSENFRYD, DYKTIG',
      alias: 'DYK1212'
    },
    careerInfo: null,
    contactInfo: {
      email: 'dyktig.tusenfryd@vtfk.no',
      mobilePhone: '12345678',
      privatePhone: '12345678',
      workPhone: '12345678',
      paycheckByEmail: 'false',
      privateEmail: 'dyktig.tusenfryd@vtfk.no',
      privateMobilePhone: '12345678'
    },
    dateOfBirth: '1980-12-12',
    dependents: null,
    employments: {
      employment: {
        bankDetails: null,
        category: {
          '@id': 'FL',
          description: 'Fast lærer'
        },
        company: {
          companyId: '1',
          companyName: 'Vestfold og Telemark fylkeskommune',
          organizationNumber: '821227062'
        },
        employeeId: '12128001',
        employmentPercentage: '100.0',
        lastChangedDate: '2021-03-10T09:07:42',
        lastEmployeed: '2012-08-01',
        paymentInAdvance: '0.00',
        pension: {
          '@name': 'Statens Pensjonskasse',
          '@value': '1'
        },
        positions: {
          position: [
            {
              '@isPrimaryPosition': 'true',
              '@validFromDate': '2021-02-01',
              chart: {
                '@id': '4',
                '@name': 'Vestfold og Telemark fylkeskommune',
                unit: {
                  '@id': '61200-60',
                  '@name': 'Nøtterøy vgs studiespesialisering språkfaglig avdeling',
                  manager: {
                    '@id': '23456',
                    '@name': 'Fjång Klut'
                  },
                  roles: null
                }
              },
              costCentres: {
                dimension2: {
                  '@name': 'Nøtterøy vgs. fellesutgifter',
                  '@value': '66100'
                },
                dimension3: {
                  '@name': 'Studiespesialisering',
                  '@value': '521'
                }
              },
              customId: '6',
              employmentPositionPercentage: '100.0',
              fixedTransactions: null,
              lastChangedDate: '2021-02-22T14:06:13',
              leave: {
                leaveFromDate: '2021-01-18',
                leavePercentage: '44.00',
                leaveReason: {
                  '@value': '5023',
                  '@name': 'Permisjon u/lønn pga annen jobb i vtfk'
                },
                leaveToDate: '2021-07-31',
                leaveType: 'Velferdspermisjon                                                                                   '
              },
              location: {
                '@name': 'Nøtterøy vgs',
                '@value': '6120'
              },
              positionCategoryNumber: '1',
              positionInfo: {
                positionCode: {
                  '@name': 'Lektor m/tilleggsutdanning',
                  '@positionCode': '7966',
                  '@positionId': '4',
                  '@tableNr': '4020'
                },
                positionType: {
                  '@name': 'Fast ansatt',
                  '@value': 'FA'
                },
                publicPositionCode: {
                  '@name': 'Lektor m. Tilleggs',
                  '@value': '7966',
                  set: 'KS',
                  setType: 'KSSKODE'
                }
              },
              positionPercentage: '56.0',
              positionStartDate: '2016-08-01',
              positionStatistics: {
                '@includeInAA': 'true',
                '@includeInPAI': 'true',
                businessNumber: {
                  '@name': 'Nøtterøy videregående skole',
                  '@value': '974575000'
                },
                companyNumber: {
                  '@name': 'Vestfold og Telemark fylkeskom',
                  '@value': '821227062'
                },
                servicePlace: {
                  '@id': '2500',
                  name: 'Videregående Skoler'
                },
                workClassification: {
                  '@name': 'Lektor (i videregående skole)',
                  '@value': '2320103'
                },
                workMunicipality: {
                  '@name': 'FÆRDER KOMMUNE',
                  '@value': '3811'
                }
              },
              salaryInfo: null,
              seniorityDate: '2006-04-01',
              shiftWork: 'false',
              weeklyHours: '37.50',
              workDaysInWeek: {
                '@friday': 'true',
                '@monday': 'true',
                '@saturday': 'false',
                '@sunday': 'false',
                '@thursday': 'true',
                '@tuesday': 'true',
                '@wednesday': 'true'
              },
              yearlyHours: '1950.00'
            },
            {
              '@isPrimaryPosition': 'false',
              '@validFromDate': '2020-12-01',
              chart: {
                '@id': '4',
                '@name': 'Vestfold og Telemark fylkeskommune',
                unit: {
                  '@id': '60020-10',
                  '@name': 'Eksamenskontoret sensor og eksamensvakter',
                  manager: {
                    '@id': '34567',
                    '@name': 'Sakte Bot'
                  },
                  roles: null
                }
              },
              costCentres: {
                dimension2: {
                  '@name': 'Privatist/eksamenskontor',
                  '@value': '62100'
                },
                dimension3: {
                  '@name': 'Andre formål',
                  '@value': '590'
                }
              },
              customId: '9',
              employmentPositionPercentage: '0.0',
              lastChangedDate: '2020-12-14T11:01:40',
              leave: null,
              location: {
                '@value': '0'
              },
              positionCategoryNumber: '9',
              positionInfo: {
                positionCode: {
                  '@name': 'Sensor',
                  '@positionCode': '4411',
                  '@positionId': '3',
                  '@tableNr': '4020'
                },
                positionType: {
                  '@name': 'Tidsavgr u/arb.avtal',
                  '@value': 'TI'
                }
              },
              positionPercentage: '0.0',
              positionStartDate: '2018-04-01',
              positionStatistics: {
                '@includeInAA': 'true',
                '@includeInPAI': 'false',
                businessNumber: {
                  '@name': 'Eksamenskontoret avd. Skien',
                  '@value': '998151228'
                },
                companyNumber: {
                  '@name': 'Vestfold og Telemark fylkeskom',
                  '@value': '821227062'
                },
                servicePlace: {
                  '@id': '0',
                  name: 'Reservert Systemet'
                },
                workMunicipality: {
                  '@name': 'SKIEN KOMMUNE',
                  '@value': '3807'
                }
              },
              salaryInfo: null,
              shiftWork: 'false',
              weeklyHours: '37.50',
              workDaysInWeek: {
                '@friday': 'true',
                '@monday': 'true',
                '@saturday': 'false',
                '@sunday': 'false',
                '@thursday': 'true',
                '@tuesday': 'true',
                '@wednesday': 'true'
              },
              yearlyHours: '1950.00'
            },
            {
              '@isPrimaryPosition': 'false',
              '@validFromDate': '2021-02-01',
              chart: {
                '@id': '4',
                '@name': 'Vestfold og Telemark fylkeskommune',
                unit: {
                  '@id': '60300-25',
                  '@name': 'Færder vgs påbygging generell studiekompetanse',
                  manager: {
                    '@id': '45678',
                    '@name': 'Fast Salt'
                  },
                  roles: null
                }
              },
              costCentres: {
                dimension2: {
                  '@name': 'FVS Påbygging generell studiekompetanse',
                  '@value': '66423'
                },
                dimension3: {
                  '@name': 'Studiespesialisering',
                  '@value': '521'
                }
              },
              employmentPositionPercentage: '0.0',
              fixedTransactions: null,
              lastChangedDate: '2021-02-11T13:17:04',
              leave: null,
              location: {
                '@name': 'Færder vgs',
                '@value': '6030'
              },
              positionCategoryNumber: '1',
              positionEndDate: '2021-07-31',
              positionInfo: {
                positionCode: {
                  '@name': 'Lektor m/tilleggsutdanning',
                  '@positionCode': '7966',
                  '@positionId': '6',
                  '@tableNr': '4020'
                },
                positionType: {
                  '@name': 'Midl. aml§14-9(2) b',
                  '@value': 'MB'
                },
                publicPositionCode: {
                  '@name': 'Lektor m. Tilleggs',
                  '@value': '7966',
                  set: 'KS',
                  setType: 'KSSKODE'
                }
              },
              positionPercentage: '44.0',
              positionStartDate: '2021-01-18',
              positionStatistics: {
                '@includeInAA': 'true',
                '@includeInPAI': 'true',
                businessNumber: {
                  '@name': 'Færder videregående skole',
                  '@value': '974575086'
                },
                companyNumber: {
                  '@name': 'Vestfold og Telemark fylkeskom',
                  '@value': '821227062'
                },
                servicePlace: {
                  '@id': '2500',
                  name: 'Videregående Skoler'
                },
                workClassification: {
                  '@name': 'Lektor (i videregående skole)',
                  '@value': '2320103'
                },
                workMunicipality: {
                  '@name': 'TØNSBERG KOMMUNE',
                  '@value': '3803'
                }
              },
              salaryInfo: null,
              seniorityDate: '2006-04-01',
              shiftWork: 'false',
              weeklyHours: '37.50',
              workDaysInWeek: {
                '@friday': 'true',
                '@monday': 'true',
                '@saturday': 'false',
                '@sunday': 'false',
                '@thursday': 'true',
                '@tuesday': 'true',
                '@wednesday': 'true'
              },
              yearlyHours: '1950.00'
            }
          ]
        },
        startDate: '2012-08-01',
        statistics: {
          paiEducation: {
            '@name': 'Bachelor lærerutdanning, pedagogikk, spesialpedagogikk',
            '@value': '220 '
          }
        },
        taxDetails: null,
        union: null,
        active: true
      }
    },
    familyName: 'Tusenfryd',
    genderCode: 'FEMALE',
    givenName: 'Dyktig',
    lastChangedDate: '2021-02-11T11:55:48',
    maritalStatus: 'MARRIED',
    municipality: {
      '@name': 'Færder kommune',
      '@value': '279'
    },
    nationalityCode: 'NO',
    postalAddress: {
      address1: 'Veien 78611',
      countryCode: 'NO',
      postalArea: 'BORDPLATE',
      postalCode: '9999'
    },
    socialSecurityOffice: {
      '@name': 'NAV SITRON',
      '@value': '87965'
    },
    ssn: '12128015478'
  },
  aad: {
    '@odata.context': 'https://graph.microsoft.com/v1.0/$metadata#users(accountEnabled,assignedLicenses,birthday,businessPhones,companyName,createdDateTime,deletedDateTime,department,displayName,givenName,jobTitle,lastPasswordChangeDateTime,mail,mobilePhone,onPremisesDistinguishedName,onPremisesExtensionAttributes,onPremisesLastSyncDateTime,onPremisesProvisioningErrors,onPremisesSamAccountName,onPremisesSyncEnabled,proxyAddresses,signInSessionsValidFromDateTime,surname,userPrincipalName,memberOf())/$entity',
    accountEnabled: true,
    businessPhones: ['12345678'],
    companyName: 'Nøtterøy videregående skole',
    createdDateTime: '2019-02-13T19:33:03Z',
    deletedDateTime: null,
    department: 'Nøtterøy vgs studiespesialisering språkfaglig avdeling',
    displayName: 'Dyktig Tusenfryd',
    givenName: 'Dyktig',
    jobTitle: 'Lektor m/tilleggsutdanning',
    lastPasswordChangeDateTime: '2019-11-18T14:18:10Z',
    mail: 'dyktig.tusenfryd@vtfk.no',
    mobilePhone: '12345678',
    onPremisesDistinguishedName: 'CN=dyk1212,OU=AUTO USERS,OU=USERS,OU=VTFK,DC=login,DC=top,DC=no',
    onPremisesLastSyncDateTime: '2021-02-12T02:41:44Z',
    onPremisesSamAccountName: 'dyk1212',
    onPremisesSyncEnabled: true,
    proxyAddresses: ['SMTP:dyktig.tusenfryd@vtfk.no', 'smtp:dyktig.tusenfryd@vtfk.onmicrosoft.com'],
    signInSessionsValidFromDateTime: '2019-11-18T14:18:10Z',
    surname: 'Tusenfryd',
    userPrincipalName: 'dyktig.tusenfryd@vtfk.no',
    birthday: '2000-10-16T00:00:00Z',
    assignedLicenses: [
      {
        disabledPlans: ['aebd3021-9f8f-4bf8-bbe3-0ed2f4f047a1', '8c7d2df8-86f0-4902-b2ed-a0458298f3b3', '2078e8df-cff6-4290-98cb-5408261a760a', '0feaeb32-d00e-4d66-bd5a-43b5b83db82c'],
        skuId: '4b590615-0888-425a-a965-b3bf7789848d'
      },
      {
        disabledPlans: [],
        skuId: 'efccb6f7-5641-4e0e-bd10-b4976e1bf68e'
      },
      {
        disabledPlans: [],
        skuId: 'f30db892-07e9-47e9-837c-80727f46fd3d'
      }
    ],
    onPremisesExtensionAttributes: {
      extensionAttribute1: null,
      extensionAttribute2: null,
      extensionAttribute3: 'FA',
      extensionAttribute4: null,
      extensionAttribute5: null,
      extensionAttribute6: 'OF-NTV-SP-SPRAK',
      extensionAttribute7: 'OF-ALLE',
      extensionAttribute8: null,
      extensionAttribute9: null,
      extensionAttribute10: null,
      extensionAttribute11: null,
      extensionAttribute12: null,
      extensionAttribute13: null,
      extensionAttribute14: null,
      extensionAttribute15: null
    },
    onPremisesProvisioningErrors: [],
    transitiveMemberOf: [
      {
        '@odata.type': '#microsoft.graph.administrativeUnit',
        id: '3896ceee-0fe1-48dc-bd73-65bdfe11f9b1',
        deletedDateTime: null,
        displayName: 'Fagskolen i Vestfold og Telemark',
        description: null,
        membershipRule: null,
        membershipType: null,
        membershipRuleProcessingState: null,
        visibility: null
      },
      {
        '@odata.type': '#microsoft.graph.group',
        id: '8da45071-d508-40d8-94ad-cceeeee3937',
        deletedDateTime: null,
        classification: null,
        createdDateTime: '2021-01-18T16:23:24Z',
        creationOptions: ['Team', 'classAssignments', 'ExchangeProvisioningFlags:2509'],
        description: 'NIK-KRL 21 B',
        displayName: 'NIK-KRL 21 B',
        expirationDateTime: null,
        groupTypes: ['Unified'],
        isAssignableToRole: null,
        mail: 'NIK-KRL21B@vtfk.no',
        mailEnabled: true,
        mailNickname: 'NIK-KRL21B',
        membershipRule: null,
        membershipRuleProcessingState: null,
        onPremisesDomainName: null,
        onPremisesLastSyncDateTime: null,
        onPremisesNetBiosName: null,
        onPremisesSamAccountName: null,
        onPremisesSecurityIdentifier: null,
        onPremisesSyncEnabled: null,
        preferredDataLocation: null,
        preferredLanguage: null,
        proxyAddresses: ['SPO:SPO_3eebffd7-1d85-4d65-8d80-660aaeeee5c@SPO_08f3813c-9f29-482f-eeec-16ee7cbf477a', 'SMTP:NIK-KRL21B@vtfk.no', 'smtp:NIK-KRL21B@vtfk.onmicrosoft.com'],
        renewedDateTime: '2021-01-18T16:23:24Z',
        resourceBehaviorOptions: ['HideGroupInOutlook', 'WelcomeEmailDisabled', 'ConnectorsDisabled', 'SubscribeNewGroupMembers'],
        resourceProvisioningOptions: ['Team'],
        securityEnabled: false,
        securityIdentifier: 'S-1-12-1-2376355953-108795e36-1724e89812-926e35178',
        theme: null,
        visibility: 'HiddenMembership',
        extension_fe2174665583431c953114eeee68b7b3_Education_ObjectType: 'Section',
        onPremisesProvisioningErrors: []
      }
    ],
    authenticationMethods: [
      {
        '@odata.type': '#microsoft.graph.microsoftAuthenticatorAuthenticationMethod',
        id: '123456789-1234-1234-1234-123456789123',
        displayName: 'iPhone',
        deviceTag: 'iOS',
        phoneAppVersion: '6.4.7',
        createdDateTime: '2020-08-08T09:54:32Z'
      },
      {
        '@odata.type': '#microsoft.graph.microsoftAuthenticatorAuthenticationMethod',
        id: '123456789-1234-1234-1234-123456789123',
        displayName: 'iPhone',
        deviceTag: 'iOS',
        phoneAppVersion: '6.4.6',
        createdDateTime: '2020-04-30T14:44:03Z'
      }
    ],
    userSignInErrors: []
  }
}

const mockUser = {
  employeeNumber: '12128015478',
  departmentShort: 'BDK-TEK',
  company: schools[0],
  expectedType: 'employee'
}

systems.forEach(system => {
  const validator = require(`../systems/${system.toLowerCase()}/validator`)
  const data = mockData[system.toLowerCase()]

  test(`Sjekker at det finnes tester for ${system}`, () => {
    expect(typeof validator).toBe('function')
  })

  test(`Sjekker at alle ${system}-tester returnerer et objekt med riktig innhold`, () => {
    const tests = validator(data, mockUser, mockData)
    expect(Array.isArray(tests)).toBe(true)
    const wrong = tests.filter(item => typeof item !== 'object' || (!item.id || !item.title || !item.description || !item.result || typeof item.result !== 'object' || !item.result.status || !item.result.message))
    expect(wrong.length).toBe(0)
  })

  test(`Sjekker at alle ${system}-tester har unik id`, () => {
    const tests = validator(data, mockUser)
    expect(Array.isArray(tests)).toBe(true)
    const ids = tests.map(item => item.id)
    tests.forEach(item => {
      expect(ids.filter(id => id === item.id).length).toBe(1)
    })
  })

  test(`Sjekker at ${system}-testene har korrekte løpenummer`, () => {
    const tests = validator(data, mockUser)
    expect(Array.isArray(tests)).toBe(true)
    let index = 1
    tests.forEach(item => {
      const id = Number.parseInt(item.id.split('-')[1])
      expect(id).toBe(index)
      index++
    })
  })
})
