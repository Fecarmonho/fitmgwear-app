@echo off
echo.
echo  ========================================
echo   FITMGWEAR - Atualizando repositorio...
echo  ========================================
echo.

cd /d "C:\Users\fecar\OneDrive\Área de Trabalho\Felipe\Arquivos\Projetos\fitmgwear\fitmgwear"

echo Corrigindo repositorio remoto...
git remote set-url origin https://github.com/Fecarmonho/fitmgwear-app.git

echo [1/3] Adicionando TODOS os arquivos...
git add .

echo [2/3] Commitando...
set /p msg="Digite a mensagem do commit (ou Enter para mensagem padrao): "
if "%msg%"=="" set msg=feat: atualizacao do sistema

git commit -m "%msg%"

echo [3/3] Enviando para o GitHub...
git push origin main --force

echo.
echo  ========================================
echo   Concluido! Repositorio atualizado.
echo  ========================================
echo.
pause
