;(function () {
    'use strict';

    let container = null;
    let isUsingChallengePoints = true;

    function showEncounters(levelRange, challengeOrDifficulty) {
        container.querySelectorAll('.encounter').forEach(encounter => {
            encounter.classList.remove('is-shown');

            if (!levelRange && encounter.classList.contains('encounter-distinct-statblocks')) {
                encounter.classList.add('is-shown');

            } else if (levelRange && encounter.classList.contains('encounter-specific-challenge')) {
                if (encounter.dataset.levelRange === levelRange) {
                    if (isUsingChallengePoints) {
                        const minChallengePoints = parseInt(encounter.dataset.minChallengePoints, 10);
                        const maxChallengePoints = parseInt(encounter.dataset.maxChallengePoints, 10);

                        if (challengeOrDifficulty >= minChallengePoints && challengeOrDifficulty <= maxChallengePoints) {
                            encounter.classList.add('is-shown');
                        }
                    } else {
                        const difficulty = encounter.dataset.difficulty;

                        if (challengeOrDifficulty === difficulty) {
                            encounter.classList.add('is-shown');
                        }
                    }
                }
            }
        });

        container.querySelectorAll('.encounter-set').forEach(encounterSet => {
            const firstShownEncounter = encounterSet.querySelector('.encounter.is-shown');

            if (firstShownEncounter) {
                encounterSet.classList.add('is-shown');
            } else {
                encounterSet.classList.remove('is-shown');
            }
        });
    }

    function handleLevelRangeChange() {
        const levelRange = container.querySelector('.encounter-option-level-range').value;

        if (isUsingChallengePoints) {
            const challengeElement = container.querySelector('#encounter-option-challenge');

            if (levelRange) {
                challengeElement.removeAttribute('disabled');
            } else {
                challengeElement.setAttribute('disabled', 'disabled');
            }

            showEncounters(levelRange, challengeElement.value);
        } else {
            const difficultyElement = container.querySelector('#encounter-option-difficulty');

            if (levelRange) {
                difficultyElement.removeAttribute('disabled');
            } else {
                difficultyElement.setAttribute('disabled', 'disabled');
            }

            showEncounters(levelRange, difficultyElement.value);
        }
    }

    function handleColumnsScreenChange() {
        if (container.querySelector('#encounter-option-columns-screen').checked) {
            container.classList.add('is-screen-columns');
        } else {
            container.classList.remove('is-screen-columns');
        }
    }

    function handleColumnsPrintChange() {
        if (container.querySelector('#encounter-option-columns-print').checked) {
            container.classList.add('is-print-columns');
        } else {
            container.classList.remove('is-print-columns');
        }
    }

    function handleJustifyPrintChange() {
        if (container.querySelector('#encounter-option-justify-print').checked) {
            container.classList.remove('is-left-align');
        } else {
            container.classList.add('is-left-align');
        }
    }

    function handleChallengeInput() {
        const levelRange = container.querySelector('.encounter-option-level-range').value;
        const challengePoints = parseInt(container.querySelector('#encounter-option-challenge').value, 10);

        showEncounters(levelRange, challengePoints);
    }

    function handleDifficultyInput() {
        const levelRange = container.querySelector('.encounter-option-level-range').value;
        const difficulty = container.querySelector('#encounter-option-difficulty').value;

        showEncounters(levelRange, difficulty);
    }

    function handlePrintFontSizeChange() {
        const printFontSizeClass = container.querySelector('.encounter-option-print-font-size').value;

        document.body.classList.remove('encounters-font-50', 'encounters-font-60', 'encounters-font-70', 'encounters-font-80', 'encounters-font-90', 'encounters-font-100');

        if (printFontSizeClass) {
            document.body.classList.add(printFontSizeClass);
        }
    }

    function init() {
        container = document.querySelector('.encounters');
        isUsingChallengePoints = container.classList.contains('is-challenge-points');

        container.querySelector('.encounter-option-level-range').addEventListener('change', handleLevelRangeChange);

        if (isUsingChallengePoints) {
            container.querySelector('#encounter-option-challenge').addEventListener('input', handleChallengeInput);
        } else {
            container.querySelector('#encounter-option-difficulty').addEventListener('input', handleDifficultyInput);
        }

        container.querySelector('#encounter-option-columns-screen').addEventListener('change', handleColumnsScreenChange);
        container.querySelector('#encounter-option-columns-print').addEventListener('change', handleColumnsPrintChange);
        container.querySelector('#encounter-option-justify-print').addEventListener('change', handleJustifyPrintChange);
        container.querySelector('.encounter-option-print-font-size').addEventListener('change', handlePrintFontSizeChange);

        container.querySelector('.print-encounters').addEventListener('click', e => {
            e.preventDefault();
            window.print();
        });

        handleLevelRangeChange();

        if (isUsingChallengePoints) {
            handleChallengeInput();
        } else {
            handleDifficultyInput();
        }

        handleColumnsScreenChange();
        handleColumnsPrintChange();
        handleJustifyPrintChange();
        handlePrintFontSizeChange();
    }

    init();
})();