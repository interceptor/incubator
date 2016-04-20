define(function (require) {
console.log('Loading module checks-generated... for [mct8_anbieter_cl/snapshot/16.3]');
var Check = require('check');
var Checkservlets = function() {
var stageInfo = {majorVersion:'16.3', stage:'snapshot'}
var checks = []
checks.push(new Check('mct8_anbieter_cl', 'snapshot', ['https://wasd85mctb2.sbb.ch:19303/mct/v9/anbieter/vertrieb/admin/check'])),

this.stageInfo = stageInfo;
this.checks = checks;
}
return Checkservlets;
});