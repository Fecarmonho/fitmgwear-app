@echo off
echo.
echo  ========================================
echo   FITMGWEAR - Atualizando repositorio...
echo  ========================================
echo.

REM %~dp0 e a pasta onde ESTE arquivo esta. Como ele mora dentro do
REM repositorio, o script funciona de qualquer lugar que voce clonar,
REM sem caminho fixo para quebrar quando a pasta mudar de lugar.
cd /d "%~dp0"

REM Se por algum motivo isto nao for um repositorio, melhor parar aqui
REM do que sair commitando na pasta errada.
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo.
  echo  ========================================
  echo   ERRO: esta pasta nao e um repositorio git.
  echo   Pasta: %~dp0
  echo.
  echo   Este arquivo precisa ficar DENTRO da pasta
  echo   do projeto para funcionar.
  echo  ========================================
  echo.
  pause
  exit /b 1
)

echo Pasta do projeto: %~dp0
echo.

echo Corrigindo repositorio remoto...
git remote set-url origin https://github.com/Fecarmonho/fitmgwear-app.git

echo [1/4] Buscando alteracoes do GitHub...
git pull --rebase origin main
if errorlevel 1 (
  echo.
  echo  ========================================
  echo   ATENCAO: nao foi possivel juntar as
  echo   alteracoes do GitHub com as daqui.
  echo.
  echo   Isso acontece quando o mesmo trecho foi
  echo   mudado nos dois lugares. Abra o projeto,
  echo   resolva o conflito e rode de novo.
  echo  ========================================
  echo.
  pause
  exit /b 1
)

echo [2/4] Adicionando TODOS os arquivos...
git add .

REM Sem mudanca para enviar, nao faz sentido seguir: o commit falharia
REM e a mensagem de erro do git so confundiria.
git diff --cached --quiet
if not errorlevel 1 (
  echo.
  echo  ========================================
  echo   Nada mudou desde o ultimo envio.
  echo   Nao ha o que atualizar.
  echo  ========================================
  echo.
  pause
  exit /b 0
)

echo [3/4] Commitando...
set /p msg="Digite a mensagem do commit (ou Enter para mensagem padrao): "
if "%msg%"=="" set msg=feat: atualizacao do sistema

git commit -m "%msg%"

echo [4/4] Enviando para o GitHub...
git push origin main
if errorlevel 1 (
  echo.
  echo  ========================================
  echo   ATENCAO: o envio foi recusado.
  echo   Alguem alterou o GitHub enquanto voce
  echo   trabalhava. Rode este arquivo de novo
  echo   que ele busca as alteracoes sozinho.
  echo  ========================================
  echo.
  pause
  exit /b 1
)

echo.
echo  ========================================
echo   Concluido! Repositorio atualizado.
echo   A Vercel publica a nova versao sozinha
echo   em um ou dois minutos.
echo  ========================================
echo.
pause
