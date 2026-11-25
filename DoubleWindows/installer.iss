#define AppName "DoubleWindows"
#define AppVersion "1.0.0"
#define AppExe "DoubleWindows.exe"

[Setup]
AppId={{B4A26C90-1D2E-4F5B-9F33-8D4A9C7B2101}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher=DoubleWindows
DefaultDirName={autopf}\DoubleWindows
DefaultGroupName=DoubleWindows
OutputDir=output
OutputBaseFilename=DoubleWindows-Setup-{#Arch}
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesInstallIn64BitMode=x64

[Files]
Source: "dist\{#AppExe}"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\DoubleWindows"; Filename: "{app}\{#AppExe}"
Name: "{autodesktop}\DoubleWindows"; Filename: "{app}\{#AppExe}"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Masaüstü kısayolu oluştur"; GroupDescription: "Ek seçenekler:"

[Run]
Filename: "{app}\{#AppExe}"; Description: "DoubleWindows uygulamasını başlat"; Flags: postinstall nowait skipifsilent
