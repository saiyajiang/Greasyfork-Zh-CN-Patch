#!/usr/bin/env bash
# 一键创建 GitHub 仓库并推送本目录内容
#
# 用法（令牌只走环境变量，不写进文件、不进 git 配置）：
#   export GH_TOKEN='你的令牌'
#   bash push-to-github.sh
#
# 令牌需要勾选权限：repo（若为 fine-grained token，则需 Administration: 读写 + Contents: 读写）

set -euo pipefail

REPO_NAME="Greasyfork-Zh-CN-Patch"
REPO_DESC="补全 Greasyfork / Sleazyfork 中文界面中未翻译、漏翻的英文文案。本脚本由 AI 编写。"
USER_NAME="saiyajiang"

if [[ -z "${GH_TOKEN:-}" ]]; then
  echo "错误：请先 export GH_TOKEN='你的令牌'" >&2
  exit 1
fi

cd "$(dirname "$0")"

echo "==> 校验令牌"
LOGIN=$(curl -sS -H "Authorization: token ${GH_TOKEN}" https://api.github.com/user \
  | grep -o '"login" *: *"[^"]*"' | head -1 | sed 's/.*: *"//;s/"//')
if [[ -z "$LOGIN" ]]; then
  echo "错误：令牌无效或已失效，请到 GitHub Settings → Developer settings 重新生成" >&2
  exit 1
fi
echo "    已认证为：$LOGIN"

echo "==> 创建仓库 ${USER_NAME}/${REPO_NAME}"
HTTP=$(curl -sS -o /tmp/gh_create.json -w '%{http_code}' \
  -X POST -H "Authorization: token ${GH_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"${REPO_NAME}\",\"description\":\"${REPO_DESC}\",\"homepage\":\"https://greasyfork.org\",\"private\":false,\"has_issues\":true,\"has_wiki\":false,\"auto_init\":false}")

if [[ "$HTTP" == "201" ]]; then
  echo "    仓库已创建"
elif [[ "$HTTP" == "422" ]]; then
  echo "    仓库已存在，直接推送"
else
  echo "错误：创建失败（HTTP $HTTP）" >&2
  cat /tmp/gh_create.json >&2
  exit 1
fi

echo "==> 配置远端并推送"
git init -q 2>/dev/null || true
git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/${USER_NAME}/${REPO_NAME}.git"

# 通过 credential helper 从环境变量取令牌，避免写入 .git/config 或命令行参数
git -c credential.helper="!f() { echo username=${LOGIN}; echo password=${GH_TOKEN}; }; f" \
    -c credential.helper='!true' \
    push -u origin main

rm -f /tmp/gh_create.json
echo
echo "完成：https://github.com/${USER_NAME}/${REPO_NAME}"
