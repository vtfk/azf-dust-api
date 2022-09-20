const { logger } = require('@vtfk/logger')
const getP360Data = require('../../lib/p360/get-p360-data')
const { repackElevmappe, repackEmployeeProject, repackUser } = require('../../lib/p360/repack-p360-data')
const getResponse = require('../../lib/get-response-object')
const { SYSTEMS: { P360 } } = require('../../config')

module.exports = async (params) => {
  // Get p360 user
  const getUserOptions = {
    url: `${P360.P360_URL}/UserService/GetUsers?authkey=${P360.P360_KEY}`,
    payload: {
      parameter: {
        UserId: `login\\${params.samAccountName}`
      }
    }
  }

  // Get p360 elevmappe
  const getElevmappeOptions = {
    url: `${P360.P360_URL}/CaseService/GetCases?authkey=${P360.P360_KEY}`,
    payload: {
      parameter: {
        Title: 'Elevmappe%',
        ContactReferenceNumber: params.employeeNumber,
        IncludeCaseContacts: true
      }
    }
  }

  // Get p360 personalprosjekt
  const getEmployeeProjectOptions = {
    url: `${P360.P360_URL}/ProjectService/GetProjects?authkey=${P360.P360_KEY}`,
    payload: {
      parameter: {
        Title: 'Personaldokumentasjon%',
        ContactReferenceNumber: params.employeeNumber,
        IncludeCaseContacts: true
      }
    }
  }

  logger('info', ['p360', 'p360-user', params.samAccountName, 'start'])
  const p360User = repackUser((await getP360Data(getUserOptions)).Users)
  logger('info', ['p360', 'p360-user', params.samAccountName, 'finish'])

  logger('info', ['p360', 'p360-elevmappe', params.employeeNumber, 'start'])
  const p360Elevmappe = repackElevmappe((await getP360Data(getElevmappeOptions)).Cases)
  logger('info', ['p360', 'p360-elevmappe', params.employeeNumber, 'finish'])

  logger('info', ['p360', 'p360-personalprosjekt', params.employeeNumber, 'start'])
  const p360EmployeeProject = repackEmployeeProject((await getP360Data(getEmployeeProjectOptions)).Projects)
  logger('info', ['p360', 'p360-personalprosjekt', params.employeeNumber, 'finish'])

  return getResponse({
    p360User,
    p360Elevmappe,
    p360EmployeeProject
  })
}
