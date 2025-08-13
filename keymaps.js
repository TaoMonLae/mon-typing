// ===== Helpers =====
const u = (hex) => String.fromCodePoint(parseInt(hex, 16));

// ===== XKB -> JS mappings (Mon Unicode basic, Mon A1 phonetic) =====
// event.code -> [base, shift]
window.MON_UNICODE_MAP = {
  Backquote: [u('105D'), u('100E')],
  Digit1: [u('1041'), u('100D')],
  Digit2: [u('1042'), u('1052')],
  Digit3: [u('1043'), u('100B')],
  Digit4: [u('1044'), u('1053')],
  Digit5: [u('1045'), '%'],
  Digit6: [u('1046'), u('1035')],
  Digit7: [u('1047'), u('101B')],
  Digit8: [u('1048'), u('1002')],
  Digit9: [u('1049'), '('],
  Digit0: [u('1040'), ')'],
  Minus: ['-', 'x'], // Shift is 'x' per XKB
  Equal: ['=', '+'],

  KeyQ: [u('1006'), u('105B')],
  KeyW: [u('1010'), u('101D')],
  KeyE: [u('1014'), u('1023')],
  KeyR: [u('1019'), u('105F')],
  KeyT: [u('1021'), u('1033')],
  KeyY: [u('1015'), u('1060')],
  KeyU: [u('1000'), u('1025')],
  KeyI: [u('105A'), u('104E')],
  KeyO: [u('101E'), u('103F')],
  KeyP: [u('1005'), u('100F')],
  BracketLeft: [u('101F'), u('1028')],
  BracketRight: [u('1029'), '/'],
  Backslash: [u('1051'), '|'],

  KeyA: [u('1031'), u('1017')],
  KeyS: [u('103B'), u('103E')],
  KeyD: [u('102D'), u('102E')],
  KeyF: [u('103A'), u('1039')],
  KeyG: [u('102B'), u('103D')],
  KeyH: [u('1034'), u('1036')],
  KeyJ: [u('103C'), u('1032')],
  KeyK: [u('102F'), u('1012')],
  KeyL: [u('1030'), u('1013')],
  Semicolon: [u('1038'), ':'],
  Quote: ["'", '"'],

  KeyZ: [u('1016'), u('1007')],
  KeyX: [u('1011'), u('100C')],
  KeyC: [u('1001'), u('1003')],
  KeyV: [u('101C'), u('1020')],
  KeyB: [u('1018'), u('1050')],
  KeyN: [u('100A'), u('1009')],
  KeyM: [u('102C'), u('1054')],
  Comma: [u('101A'), u('105E')],
  Period: [u('105C'), u('1055')],
  Slash: [u('104B'), u('104A')],
  Space: [' ', ' ']
};

window.MON_A1_MAP = {
  Backquote: ['`', '~'],
  Digit1: [u('1041'), '!'],
  Digit2: [u('1042'), '@'],
  Digit3: [u('1043'), u('1053')],
  Digit4: [u('1044'), u('1029')],
  Digit5: [u('1045'), '%'],
  Digit6: [u('1046'), u('1050')],
  Digit7: [u('1047'), u('1051')],
  Digit8: [u('1048'), '*'],
  Digit9: [u('1049'), '('],
  Digit0: [u('1040'), ')'],
  Minus: ['-', '_'],
  Equal: ['=', '+'],

  KeyQ: [u('101E'), u('103F')],
  KeyW: [u('101D'), u('103D')],
  KeyE: [u('1031'), u('1035')],
  KeyR: [u('101B'), u('103C')],
  KeyT: [u('1010'), u('1011')],
  KeyY: [u('101A'), u('103B')],
  KeyU: [u('102F'), u('1030')],
  KeyI: [u('102D'), u('1033')],
  KeyO: [u('1032'), u('1034')],
  KeyP: [u('1015'), u('100F')],
  BracketLeft: [u('100D'), u('1028')],
  BracketRight: [u('100E'), u('1054')],
  Backslash: [u('105C'), u('105D')],

  KeyA: [u('1021'), u('1023')],
  KeyS: [u('1005'), u('1006')],
  KeyD: [u('1012'), u('1013')],
  KeyF: [u('1016'), u('1039')],
  KeyG: [u('1002'), u('1003')],
  KeyH: [u('101F'), u('103E')],
  KeyJ: [u('103A'), u('102E')],
  KeyK: [u('1000'), u('1001')],
  KeyL: [u('101C'), u('1060')],
  Semicolon: [u('1025'), u('1020')],
  Quote: ["'", '"'],

  KeyZ: [u('1007'), u('105B')],
  KeyX: [u('100B'), u('100C')],
  KeyC: [u('105A'), u('104E')],
  KeyV: [u('100A'), u('1009')],
  KeyB: [u('1017'), u('1018')],
  KeyN: [u('1014'), u('105E')],
  KeyM: [u('1019'), u('105F')],
  Comma: [u('1036'), u('1038')],
  Period: [u('102C'), u('102B')],
  Slash: [u('104A'), u('104B')],
  Space: [' ', ' ']
};

// Row order for rendering
window.ROWS = [
  ['Backquote','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0','Minus','Equal'],
  ['KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP','BracketLeft','BracketRight','Backslash'],
  ['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon','Quote'],
  ['KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period','Slash'],
  ['Space']
];

// Finger mapping (by physical code)
window.CODE_TO_FINGER = {
  Backquote:'LP', Digit1:'LP', Digit2:'LR', Digit3:'LM', Digit4:'LI', Digit5:'LI',
  Digit6:'RI', Digit7:'RI', Digit8:'RM', Digit9:'RR', Digit0:'RP', Minus:'RP', Equal:'RP',
  KeyQ:'LP', KeyW:'LR', KeyE:'LM', KeyR:'LI', KeyT:'LI', KeyY:'RI', KeyU:'RI', KeyI:'RM', KeyO:'RR', KeyP:'RP',
  BracketLeft:'RP', BracketRight:'RP', Backslash:'RP',
  KeyA:'LP', KeyS:'LR', KeyD:'LM', KeyF:'LI', KeyG:'LI', KeyH:'RI', KeyJ:'RI', KeyK:'RM', KeyL:'RR', Semicolon:'RP', Quote:'RP',
  KeyZ:'LP', KeyX:'LR', KeyC:'LM', KeyV:'LI', KeyB:'LI', KeyN:'RI', KeyM:'RI', Comma:'RM', Period:'RR', Slash:'RP',
  Space:'TH'
};
