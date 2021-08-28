# 원터치 자가진단 백엔드
자가진단을 원터치로!

# 응답 코드표
|응답코드|http 응답코드|설명|권장하는 조치|
|-|-|-|-|
|need_more_info|400|필수 정보가 누락되어있습니다|필수 정보를 정확히 입력하였는지 확인하세요|
|schools_not_fount|400|검색된 학교가 없습니다|학교 이름을 정확히 입력하세요|
|schools_too_many|400|검색된 학교가 너무 많습니다|학교 이름을 정확히 입력하세요|
|first_login_failed|400|1단계 로그인에 실패하였습니다|이름, 생년월일, 학교를 확인하세요|
|second_login_failed|400|2단계 로그인에 실패하였습니다|비밀번호를 확인하세요|
|wait_please|403|비밀번호 입력 쿨타임|잘못된 비밀번호를 5회이상 입력하여 5분후 재시도 해야 합니다|
|wrong_password|403|비밀번호 틀림|잘못된 비밀번호를 입력했습니다|
|self_check_success|200|자가진단 완료|자가진단을 성공적으로 완료했습니다|