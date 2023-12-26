Game.registerMod("lumpScumAuto", {
    init: function () {
        let MOD = this;
        MOD.awaitGameLoad();
    },
    save: function () {
        let MOD = this;
        const save = {
            // Button 1
            desiredLumpID: MOD.desiredLumpID,
            // Button 2
            desiredLumpYield: MOD.desiredLumpYield,
            // Button 3
            iterationCutoff: MOD.iterationCutoff,
            // Button 4
            durationCutoffHourRaw: MOD.durationCutoffHourRaw,
            durationCutoffMinuteRaw: MOD.durationCutoffMinuteRaw,
            durationCutoffSecondRaw: MOD.durationCutoffSecondRaw,
            durationCutoffMillisecondRaw: MOD.durationCutoffMillisecondRaw,
            // Button 5
            scumInProgress: MOD.scumInProgress,
            scumStartTime: MOD.scumStartTime,
            scumIterations: MOD.scumIterations,
            autoScumActive: MOD.autoScumActive,
            checkInterval: MOD.checkInterval,
            initialGameSave: MOD.initialGameSave,
            initialLumpCount: MOD.initialLumpCount
        };
        return JSON.stringify(save);
    },
    load: function (str) {
        let MOD = this;
        loadStr = str;
        MOD.returnSavedData();
    },
    createButtons: function () {
        let MOD = this;
        l('storeTitle').insertAdjacentHTML('beforeend', '<a style="font-size:14px;position:reletive;bottom:2px;right:2px;display:block;" class="smallFancyButton" id="desiredLumpID"></a>');
        AddEvent(l('desiredLumpID'), 'click', function () {
            MOD.desiredLumpID++;
            MOD.updateButtons();
        });

        l('storeTitle').insertAdjacentHTML('beforeend', '<a style="font-size:14px;position:reletive;bottom:2px;right:2px;display:block;" class="smallFancyButton" id="desiredLumpYield"></a>');
        AddEvent(l('desiredLumpYield'), 'click', function () {
            MOD.desiredLumpYield++;
            MOD.updateButtons();
        });

        l('storeTitle').insertAdjacentHTML('beforeend', '<a style="font-size:14px;position:reletive;bottom:2px;right:2px;display:block;" class="smallFancyButton" id="iterationCutoff"></a>');
        AddEvent(l('iterationCutoff'), 'click', function () {

            if (MOD.iterationCutoff >= 69420) { MOD.iterationCutoff = 0; }
            else if (MOD.iterationCutoff === 10000) { MOD.iterationCutoff = 69420; }
            else if (MOD.iterationCutoff >= 1000) { MOD.iterationCutoff += 1000; }
            else if (MOD.iterationCutoff >= 100) { MOD.iterationCutoff += 100; }
            else if (MOD.iterationCutoff >= 10) { MOD.iterationCutoff += 10; }
            else { MOD.iterationCutoff += 1; }
            MOD.updateButtons();
        });

        l('storeTitle').insertAdjacentHTML('beforeend', '<a style="font-size:14px;position:reletive;bottom:2px;right:2px;display:block;" class="smallFancyButton" id="durationCutoff"></a>');
        AddEvent(l('durationCutoff'), 'click', function () {
            MOD.durationCutoffMillisecondRaw += 100;
            MOD.updateButtons();
        });

        l('storeTitle').insertAdjacentHTML('beforeend', '<a style="font-size:14px;position:reletive;bottom:2px;right:2px;display:block;" class="smallFancyButton" id="scumActivate"></a>');
        AddEvent(l('scumActivate'), 'click', function () {
            /* MOD.scumInProgress = true;
            MOD.scumStartTime = Date.now();
            MOD.scumIterations = 0;
            MOD.initialLumpCount = Game.lumps;
            MOD.updateButtons();
            MOD.scumLump(); */
            MOD.startScum();
        });

        l('storeTitle').insertAdjacentHTML('beforeend', '<a style="font-size:14px;position:reletive;bottom:2px;right:2px;display:block;" class="smallFancyButton" id="autoScum"></a>');
        AddEvent(l('autoScum'), 'click', function () {
            MOD.autoScumActive = !MOD.autoScumActive;
            if (MOD.autoScumActive) {
                MOD.updateButtons();
                MOD.continuousCheck();
            } else {
                clearInterval(MOD.checkInterval);
                MOD.updateButtons();
            }
        });

        l('storeTitle').insertAdjacentHTML('beforeend', '<a style="font-size:14px;position:reletive;bottom:2px;right:2px;display:block;" class="smallFancyButton" id="clearSettings"></a>');
        AddEvent(l('clearSettings'), 'click', function () {
            MOD.initializeVariables();
            MOD.updateButtons();
        });
    },
    updateButtons: function () {
        let MOD = this;
        MOD.impossibleButtonStateChecks();
        MOD.objectIDToText();
        MOD.durationCutoffConversion();
        l('desiredLumpID').innerHTML = 'Desired Lump Type: ' + MOD.desiredLumpType;
        l('desiredLumpYield').innerHTML = 'Current Lump Type: ' + MOD.currentLumpType + '<br>Desired Lump yield: ' + MOD.desiredLumpYieldText;
        l('iterationCutoff').innerHTML = 'Iteration Cutoff: ' + MOD.iterationCutoff;
        l('durationCutoff').innerHTML = 'Duration Cutoff: ' + MOD.durationCutoffTotalText;
        l('scumActivate').innerHTML = 'Scum Your Lump!';
        l('autoScum').innerHTML = MOD.autoScumActive ? 'Stop Auto Scum' : 'Auto Scum Lumps'
        l('clearSettings').innerHTML = 'Clear Settings';
    },
    impossibleButtonStateChecks: function () {
        let MOD = this;
        if (MOD.desiredLumpID === 3 && Game.elderWrath === 0) {
            MOD.desiredLumpID = 4
        }
        else if (MOD.desiredLumpID > 4) {
            MOD.desiredLumpID = -1;
        }



        switch (Game.lumpCurrentType) {
            case 0:
                MOD.maxLumpYield = 1;
                break;
            case 1:
                MOD.maxLumpYield = 2;
                break;
            case 2:
                MOD.maxLumpYield = 7;
                break;
            case 3:
                MOD.maxLumpYield = 2;
                break;
            case 4:
                MOD.maxLumpYield = 3;
                break;
        }

        if (MOD.desiredLumpYield > MOD.maxLumpYield + 1) {
            if (Game.time - Game.lumpT < Game.lumpRipeAge) {
                MOD.desiredLumpYield = 0;
            }
            else if ((Game.time - Game.lumpT > Game.lumpRipeAge) && (Game.time - Game.lumpT < Game.lumpOverripeAge)) {
                MOD.desiredLumpYield = 1;
            }
        }

        if (Game.lumpCurrentType === 2 && MOD.desiredLumpYield === 1) {
            MOD.desiredLumpYield = 2;
        }

        if (MOD.durationCutoffMillisecondRaw === 1000) {
            MOD.durationCutoffMillisecondRaw = 0
            if (MOD.durationCutoffSecondRaw >= 5) {
                MOD.durationCutoffSecondRaw += 5
            }
            else { MOD.durationCutoffSecondRaw += 1 }
        }

        if (MOD.durationCutoffSecondRaw === 60) {
            MOD.durationCutoffSecondRaw = 0
            if (MOD.durationCutoffMinuteRaw >= 5) {
                MOD.durationCutoffMinuteRaw += 5
            }
            else { MOD.durationCutoffMinuteRaw += 1 }
        }

        if (MOD.durationCutoffMinuteRaw === 60) {
            MOD.durationCutoffMinuteRaw = 0
            MOD.durationCutoffHourRaw += 1
        }

        if (MOD.durationCutoffHourRaw === 4 && MOD.durationCutoffMillisecondRaw > 0) {
            MOD.durationCutoffHourRaw = 0
            MOD.durationCutoffMillisecondRaw = 0;
        }
    },
    objectIDToText: function () {
        let MOD = this;
        switch (MOD.desiredLumpID) {
            case -1:
                MOD.desiredLumpType = 'Any Lump';
                break;
            case 0:
                MOD.desiredLumpType = 'Sugar Lump';
                break;
            case 1:
                MOD.desiredLumpType = 'Bifurcated Lump';
                break;
            case 2:
                MOD.desiredLumpType = 'Golden Lump';
                break;
            case 3:
                MOD.desiredLumpType = 'Meaty Lump';
                break;
            case 4:
                MOD.desiredLumpType = 'Caramelized Lump';
                break;
        }

        switch (Game.lumpCurrentType) {
            case 0:
                MOD.currentLumpType = 'Sugar Lump';
                break;
            case 1:
                MOD.currentLumpType = 'Bifurcated Lump';
                break;
            case 2:
                MOD.currentLumpType = 'Golden Lump';
                break;
            case 3:
                MOD.currentLumpType = 'Meaty Lump';
                break;
            case 4:
                MOD.currentLumpType = 'Caramelized Lump';
                break;
        }

        switch (MOD.desiredLumpYield) {
            case MOD.maxLumpYield + 1:
                MOD.desiredLumpYieldText = 'Any Yield';
                break;

            default:
                MOD.desiredLumpYieldText = MOD.desiredLumpYield;
                break;
        }
    },
    durationCutoffConversion: function () {
        let MOD = this;
        MOD.durationCutoffHourText = MOD.durationCutoffHourRaw;

        if (MOD.durationCutoffMinuteRaw < 1) {
            MOD.durationCutoffMinuteText = '00';
        }
        else if (MOD.durationCutoffMinuteRaw < 10) {
            MOD.durationCutoffMinuteText = '0' + MOD.durationCutoffMinuteRaw;
        }
        else { MOD.durationCutoffMinuteText = MOD.durationCutoffMinuteRaw; }

        if (MOD.durationCutoffSecondRaw < 1) {
            MOD.durationCutoffSecondText = '00';
        }
        else if (MOD.durationCutoffSecondRaw < 10) {
            MOD.durationCutoffSecondText = '0' + MOD.durationCutoffSecondRaw;
        }
        else { MOD.durationCutoffSecondText = MOD.durationCutoffSecondRaw; }

        if (MOD.durationCutoffMillisecondRaw < 1) {
            MOD.durationCutoffMillisecondText = '000';
        }
        else if (MOD.durationCutoffMillisecondRaw < 10) {
            MOD.durationCutoffMillisecondText = '00' + MOD.durationCutoffMillisecondRaw;
        }
        else if (MOD.durationCutoffMillisecondRaw < 100) {
            MOD.durationCutoffMillisecondText = '0' + MOD.durationCutoffMillisecondRaw;
        }
        else { MOD.durationCutoffMillisecondText = MOD.durationCutoffMillisecondRaw; }

        MOD.durationCutoffTotalRaw = (MOD.durationCutoffHourRaw * (1000 * 60 * 60)) + (MOD.durationCutoffMinuteRaw * (1000 * 60)) + (MOD.durationCutoffSecondRaw * (1000)) + MOD.durationCutoffMillisecondRaw;
        MOD.durationCutoffTotalText = MOD.durationCutoffHourText + ':' + MOD.durationCutoffMinuteText + ':' + MOD.durationCutoffSecondText + '.' + MOD.durationCutoffMillisecondText;

    },
    durationFinishConversion: function () {
        let MOD = this;
        MOD.scumHoursRaw = Math.floor(MOD.scumTotalTime / (1000 * 60 * 60));
        MOD.scumMinutesRaw = Math.floor((MOD.scumTotalTime - (MOD.scumHoursRaw * (1000 * 60 * 60))) / (1000 * 60));
        MOD.scumSecondsRaw = Math.floor((MOD.scumTotalTime - ((MOD.scumHoursRaw * (1000 * 60 * 60)) + (MOD.scumMinutesRaw * (1000 * 60)))) / (1000));
        MOD.scumMillisecondsRaw = (MOD.scumTotalTime - ((MOD.scumHoursRaw * (1000 * 60 * 60)) + (MOD.scumMinutesRaw * (1000 * 60)) + (MOD.scumSecondsRaw * (1000))));

        MOD.scumHoursText = MOD.scumHoursRaw;

        if (MOD.scumMinutesRaw < 1) { MOD.scumMinutesText = '00'; }
        else if (MOD.scumMinutesRaw < 10) { MOD.scumMinutesText = '0' + MOD.scumMinutesRaw; }
        else { MOD.scumMinutesText = MOD.scumMinutesRaw; }

        if (MOD.scumSecondsRaw < 1) { MOD.scumSecondsText = '00'; }
        else if (MOD.scumSecondsRaw < 10) { MOD.scumSecondsText = '0' + MOD.scumSecondsRaw; }
        else { MOD.scumSecondsText = MOD.scumSecondsRaw; }

        if (MOD.scumMillisecondsRaw < 1) { MOD.scumMillisecondsText = '000'; }
        else if (MOD.scumMillisecondsRaw < 10) { MOD.scumMillisecondsText = '00' + MOD.scumMillisecondsRaw; }
        else if (MOD.scumMillisecondsRaw < 100) { MOD.scumMillisecondsText = '0' + MOD.scumMillisecondsRaw; }
        else { MOD.scumMillisecondsText = MOD.scumMillisecondsRaw; }

        MOD.scumTotalText = MOD.scumHoursText + ":" + MOD.scumMinutesText + ":" + MOD.scumSecondsText + "." + MOD.scumMillisecondsText;
    },
    scumLump: function () {
        let MOD = this;

        if (Game.time - Game.lumpT < Game.lumpMatureAge) {
            if (MOD.scumIterations === 0) {
                MOD.scumInProgress = false;
                Game.Notify(`Sugar Lump Not Ready.`, 'This Sugar Lump has not fully Matured yet.', [23, 14]);
            }
            else {
                MOD.scumInProgress = false;
                Game.Notify(`Wow, just wow.`, 'You actually managed to take so long to scum your lump that it fully ripened and auto harvested. I am in shock at this level of incompetency, congratulations.', [13, 11]);
            }
        }
        else {
            MOD.scumIterations++;
            MOD.scumEndTime = Date.now();
            MOD.scumTotalTime = MOD.scumEndTime - MOD.scumStartTime;
            MOD.initialGameSave = Game.WriteSave(1);
            Game.clickLump();
            MOD.scumStarted = true;
            if (MOD.iterationCutoff > 0 && MOD.scumIterations >= MOD.iterationCutoff) {
                MOD.scumInProgress = false;
                MOD.updateButtons();
                MOD.durationFinishConversion();
                Game.Notify(`Skill Issue?`, `After ` + MOD.scumIterations + ' attempts encompassing ' + MOD.scumTotalText + ' you failed to scum your lump.', [, , ortrollIcon]);
            }
            else if (MOD.durationCutoffTotalRaw > 0 && MOD.scumTotalTime > MOD.durationCutoffTotalRaw) {
                MOD.scumInProgress = false;
                MOD.updateButtons();
                MOD.durationFinishConversion();
                Game.Notify(`Skill Issue?`, `After ` + MOD.scumIterations + ' attempts encompassing ' + MOD.scumTotalText + ' you failed to scum your lump.', [, , ortrollIcon]);
            }
            else if ((Game.lumpCurrentType === MOD.desiredLumpID || MOD.desiredLumpID === -1) && ((Game.lumps - MOD.initialLumpCount) === MOD.desiredLumpYield || MOD.desiredLumpYield === MOD.maxLumpYield + 1)) {
                MOD.updateButtons();
                MOD.durationFinishConversion();
                Game.Notify(MOD.desiredLumpType + ' Scummed Successfully!', 'After ' + MOD.scumIterations + ' attempts encompassing ' + MOD.scumTotalText + ' you managed to scum your lump.', [10, 6]);
                MOD.scumInProgress = false;
                MOD.scumStartTime = 0;
                MOD.scumIterations = 0;
                MOD.initialLumpCount = 0;
                MOD.initialGameSave = 0;
            }
            else {
                MOD.scumEndTime = 0;
                MOD.scumTotalTime = 0;
                Game.ImportSaveCode(MOD.initialGameSave);
            }
        }
    },   
    continuousCheck: function () {
        let MOD = this;

        MOD.checkInterval = setInterval(function() {
            if (MOD.autoScumActive && !MOD.scumStarted && (Game.time - Game.lumpT >= Game.lumpRipeAge)) {
                MOD.startScum();
            }
        }, 300000);
    },
    startScum: function () {
        let MOD = this;

        MOD.scumInProgress = true;
        MOD.scumStartTime = Date.now();
        MOD.scumIterations = 0;
        MOD.initialLumpCount = Game.lumps;
        MOD.updateButtons();
        MOD.scumLump();
    },
    gameLoadTest: function () {
        let gameLoaded = new Promise((resolve, reject) => {
            if (Game.lumps > -1) { resolve('true') }
            else { reject('false') }
        });

        gameLoaded.then(() => { }).catch(() => { });
    },
    awaitGameLoad: async function () {
        let MOD = this;
        gameLoadedTrue = await MOD.gameLoadTest('true'); // Waits for the Sugar Lump counter to be greater than -1 to ensure the game has loaded,
        Game.Notify(`Lump-O-Matic Loaded!`, `Glucose Is In Sight!`, [22, 17]); // Creates a notification on screen to let the player know the mod is enabled.
        setTimeout(() => { // Grants the Third-party achievment with a small time delay so it properly activates.
            Game.Win('Third-party')
        }, 100);
        MOD.initializeVariables();
        MOD.createButtons();
        MOD.updateButtons();
    },
    returnSavedData: async function () {
        let MOD = this;
        gameLoadedTrue = await MOD.gameLoadTest('true');
        var save = JSON.parse(loadStr);
        // Button 1
        MOD.desiredLumpID = save.desiredLumpID
        // Button 2
        MOD.desiredLumpYield = save.desiredLumpYield
        // Button 3
        MOD.iterationCutoff = save.iterationCutoff
        // Button 4
        MOD.durationCutoffHourRaw = save.durationCutoffHourRaw
        MOD.durationCutoffMinuteRaw = save.durationCutoffMinuteRaw
        MOD.durationCutoffSecondRaw = save.durationCutoffSecondRaw
        MOD.durationCutoffMillisecondRaw = save.durationCutoffMillisecondRaw
        // Button 5
        MOD.scumInProgress = save.scumInProgress
        MOD.scumStartTime = save.scumStartTime
        MOD.scumIterations = save.scumIterations
        MOD.initialGameSave = save.initialGameSave
        MOD.initialLumpCount = save.initialLumpCount
        // Button 6
        MOD.autoScumActive = save.autoScumActive
        MOD.checkInterval = save.checkInterval
        MOD.updateButtons();
        if (MOD.scumInProgress === true && MOD.scumStarted === false) {
            MOD.scumLump();
        }
    },
    initializeVariables: function () {
        let MOD = this;
        // Button 1
        MOD.desiredLumpID = 0;
        MOD.desiredLumpType = 0;
        // Button 2
        MOD.currentLumpType = 0;
        MOD.desiredLumpYield = 0;
        MOD.desiredLumpYieldText = 0;
        MOD.maxLumpYield = 0;
        // Button 3
        MOD.iterationCutoff = 0;
        // Button 4
        MOD.durationCutoffTotalRaw = 0;
        MOD.durationCutoffHourRaw = 0;
        MOD.durationCutoffMinuteRaw = 0;
        MOD.durationCutoffSecondRaw = 0;
        MOD.durationCutoffMillisecondRaw = 0;

        MOD.durationCutoffTotalText = 0;
        MOD.durationCutoffHourText = 0;
        MOD.durationCutoffMinuteText = 0;
        MOD.durationCutoffSecondText = 0;
        MOD.durationCutoffMillisecondText = 0;
        // Button 5
        MOD.scumInProgress = false;
        MOD.scumStartTime = 0;
        MOD.scumEndTime = 0;
        MOD.scumTotalTime = 0;
        MOD.scumIterations = 0;
        MOD.initialLumpCount = 0;
        MOD.PostClickLumpCount = 0;
        MOD.initialGameSave = 0;
        MOD.scumStarted = false;
        // Button 6
        MOD.autoScumActive = false;
        MOD.checkInterval = null;
        // Misc.
        ortrollIcon = MOD.dir + '/ortroll.webp';
        save = 0;

        MOD.scumHoursRaw = 0;
        MOD.scumMinutesRaw = 0;
        MOD.scumSecondsRaw = 0;
        MOD.scumMillisecondsRaw = 0;

        MOD.scumTotalText = 0;
        MOD.scumHoursText = 0;
        MOD.scumMinutesText = 0;
        MOD.scumMillisecondsText = 0;
    }
});