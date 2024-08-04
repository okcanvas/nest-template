
KAKAO_BUCKET_NAME=boksaeng-dev
KAKAO_ACCOUNT=9903a4e4a2384dac89fbf871c7f3aab4

사용자액세스키ID=1507648baada4ed09c7e6973c487cb4d
사용자액세스보안키=VTLuMSrJ9NMexVTs4sTOfSl0p5kvv-cFflWjNDA9CmT5FZMdenAyWwKkw4prCxJIu0OFtVcqs4NnI0S8YEVCyg

curl --location --request PUT 'https://objectstorage.kr-central-1.kakaoi.io/v1/{account}/{bucket_name}/{path}/{file}' \
--header 'X-Auth-Token: {x-auth-token}' \
--header 'Content-Type: text/plain' \
--data-raw '{Content}'

https://objectstorage.kr-central-1.kakaoi.io/v1/f4eb3ad7c6cf4c2982d7def1d3345065/boksaeng-dev/KakaoTalk_20230420_084938149_03.jpg


##  API 인증 토큰 발급하기
curl  POST  https://iam.kakaoi.io/identity/v3/auth/tokens
body
{
    "auth": {
        "identity": {
            "methods": [
                "application_credential"
            ],
            "application_credential": {
                "id": "1507648baada4ed09c7e6973c487cb4d",
                "secret": "VTLuMSrJ9NMexVTs4sTOfSl0p5kvv-cFflWjNDA9CmT5FZMdenAyWwKkw4prCxJIu0OFtVcqs4NnI0S8YEVCyg"
            }
        }
    }
}