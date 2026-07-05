#define MyAppName "MemeBlip"
#define MyAppPublisher "Dawnlight Labs"
#define MyAppURL "https://github.com/amaansyed27/meme-blip"
#define MyAppExeName "MemeBlip.exe"
#ifndef MyAppVersion
#define MyAppVersion "0.1.0"
#endif

[Setup]
AppId={{E1E3B7A0-4CE4-4F80-9C70-3F0D9C8D16AB}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\MemeBlip
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
OutputDir=..\..\release
OutputBaseFilename=MemeBlip-Windows-Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

[Files]
Source: "..\..\release\MemeBlip-Windows\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\MemeBlip"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\MemeBlip"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional icons:"

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Launch MemeBlip"; Flags: nowait postinstall skipifsilent
