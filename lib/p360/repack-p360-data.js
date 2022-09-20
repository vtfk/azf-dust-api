const repackUser = (userData) => {
  const repacked = userData.map(user => {
    return {
      Login: user.Login,
      IsActive: user.IsActive
    }
  })
  return repacked
}

const repackElevmappe = (elevmappeData) => {
  const repacked = elevmappeData.map(mappe => {
    return {
      Title: mappe.Title,
      CaseNumber: mappe.CaseNumber
    }
  })
  return repacked
}

const repackEmployeeProject = (projectData) => {
  const repacked = projectData.map(project => {
    return {
      Title: project.Title,
      ProjectNumber: project.ProjectNumber
    }
  })
  return repacked
}

module.exports = { repackElevmappe, repackEmployeeProject, repackUser }
