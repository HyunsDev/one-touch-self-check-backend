const hcs = require('hcs.js')


;(async () => {
    const schools = await hcs.searchSchool("서령고등학교")
    const school = schools[0]
    const name = "박현우"
    const birth = "040708"
    const password = "3071"
    const login = await hcs.login(school.endpoint, school.schoolCode, name, birth)

    const survey = {
        Q1: false,
        Q2: false,
        Q3: false,
    }

    const secondLogin = await hcs.secondLogin(school.endpoint, login.token, password)
    console.log(secondLogin)
    const result = await hcs.registerSurvey(school.endpoint, secondLogin.token, survey)
    console.log(result)



})()
