var express = require('express');
var router = express.Router();
const hcs = require('hcs.js')
const { Webhook, MessageBuilder  } = require('discord-webhook-node');
const hook = new Webhook(process.env.DISCORD_LOGGER);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    result: "원터치 자가진단",
    version: "v1",
    last_update: "2021-08-27"
  })
});

router.post('/v1/check', async function(req, res, next) {
  const name = req.body.name
  const birth = req.body.birth
  const password = req.body.password
  const req_school = req.body.school || "서령고등학교"

  let error_count = 0
  while (true) {
    try {
      if (!name || !birth || !password) {
        res.status(400).json({
          code: "need_more_info",
          message: `자기진단에 필수적인 정보가 없습니다. name:${name}, birth: ${birth}, password: ${password}`
        })
        return
      }

      // 학교 선택
      // const schools = await hcs.searchSchool(req_school)
      // console.log(schools)
      // if (schools.length === 0) {
      //   res.status(400).json({
      //     code: 'schools_not_fount',
      //     message: `검색된 학교가 없습니다.. school:${req_school}`
      //   })
      //   return
      // }
      // if (schools.length > 1) {
      //   res.status(400).json({
      //     code: 'schools_too_many',
      //     message: `검색된 학교가 너무 많습니다. school:${req_school}`
      //   })
      //   return
      // }
      // const school = schools[0]
      const school = {
        name: '서령고등학교',
        nameEn: 'Seoryeong High School',
        city: '충청남도',
        address: '(31965)충청남도 서산시 서령로 117-1 (동문동,서령고등학교)',
        endpoint: 'cnehcs.eduro.go.kr',
        schoolCode: 'N100000176'
      }

      // 1단계 로그인
      const login = await hcs.login(school.endpoint, school.schoolCode, name, birth)
      if (!login.success) {
        res.status(400).json({
          code: 'first_login_failed',
          message: `1단계 로그인에 실패하였습니다. 이름과 생년월일이 올바르게 작성되었는지 확인해주세요. name:${name}, birth: ${birth}`
        })
        return
      }
      if (login.agreementRequired) {
        await hcs.updateAgreement(school.endpoint, login.token)
      }

      // 2단계 로그인
      let secondLogin
      let count = 0
      while (true) {
        try {
          secondLogin = await hcs.secondLogin(school.endpoint, login.token, password)
          break
        } catch (err) {
          console.error(err)
          count = count + 1
          console.log(`${count}차 시도`)
          if (count > 3) {
            res.status(403).json({
              code: 'second_login_failed',
              message: `2단계 로그인에 실패하였습니다. 비밀번호를 확인해주세요. ${password}`
            })
            return
          }
        }
      }

      
      if (!secondLogin.success) {
        if (secondLogin.remainingMinutes) {
          res.status(403).json({
            code: 'wait_please',
            message: `비밀번호를 5회 이상 실패하여 ${secondLogin.remainingMinutes}분 후에 재시도가 가능합니다.`,
            minutes: secondLogin.remainingMinutes
          })
          return
        }
        res.status(403).json({
          code: 'wrong_password',
          message: `비밀번호가 틀립니다. 다시 시도해주세요. ${password}`,
          fail_count: secondLogin.failCount
        })
        return
      }

      const survey = {
        Q1: false,
        Q2: false,
        Q3: false,
      }
      await hcs.registerSurvey(school.endpoint, secondLogin.token, survey)

      const embed = new MessageBuilder()
      .setTitle(`${name}(${birth})님이 자가진단을 완료했습니다.`)
      .setFooter("원터치 자가진단", "https://media.discordapp.net/attachments/912369996737413190/912371380283125770/icon.png")
      .setColor("#0067f9")
      .setTimestamp()
      await hook.send(embed)

      res.json({
        code: "self_check_success",
        message: "자가진단을 성공적으로 완료했습니다."
      })
      break
    } catch (err) {
      console.error(err)
      error_count = error_count + 1
      if (error_count > 3) {
        res.status(500).json({
          code: 'server_error',
          message: `서버 에러, 다시 시도하세요`,
        })
      }
    } 
  }
});


module.exports = router;
