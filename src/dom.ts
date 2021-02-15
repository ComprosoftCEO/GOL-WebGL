import { Life } from './life';
import Color from 'color';
import lodash from 'lodash';
import { vec3 } from 'gl-matrix';

// Constants
const COLOR_PICKER_ID = 'color-picker';
const DENSITY_ID = 'random-grid-density';

const beginCheckboxId = (n: number) => `begin-${n}`;
const surviveCheckboxId = (n: number) => `survive-${n}`;

// LOL I should probably use React for this
export function initDomControls(color: vec3, life: Life, resetLife: () => void): void {
  const refreshDom = () => {
    const currentColor = Color.rgb(color[0] * 255, color[1] * 255, color[2] * 255);
    (document.getElementById(COLOR_PICKER_ID) as HTMLInputElement).value = currentColor.hex();

    for (let i = 0; i <= 12; i += 1) {
      (document.getElementById(beginCheckboxId(i)) as HTMLInputElement).checked = life.rule.testBegin(i);
      (document.getElementById(surviveCheckboxId(i)) as HTMLInputElement).checked = life.rule.testSurvive(i);
    }
  };

  const setColor = () => {
    const inputValue = (document.getElementById(COLOR_PICKER_ID) as HTMLInputElement).value;
    const newColor = Color(inputValue).rgb();
    color[0] = newColor.red() / 255;
    color[1] = newColor.green() / 255;
    color[2] = newColor.blue() / 255;

    refreshDom();
  };

  const setRule = () => {
    for (let i = 0; i <= 12; i += 1) {
      const beginValue = (document.getElementById(beginCheckboxId(i)) as HTMLInputElement).checked;
      const surviveValue = (document.getElementById(surviveCheckboxId(i)) as HTMLInputElement).checked;

      life.rule.setBegin(i, beginValue);
      life.rule.setSurvive(i, surviveValue);
    }

    refreshDom();
  };

  const randomizeRule = () => {
    const begin = new Set(lodash.range(13).filter(() => Math.random() > 0.5));
    const survive = new Set(lodash.range(13).filter(() => Math.random() > 0.5));

    life.rule.setBeginValues(begin);
    life.rule.setSurviveValues(survive);

    refreshDom();
  };

  const randomizeLife = () => {
    const density = parseFloat((document.getElementById(DENSITY_ID) as HTMLInputElement).value);
    life.randomize(density);
    resetLife();
    refreshDom();
  };

  // Create public functions
  Object.assign(window, {
    setColor,
    setRule,
    randomizeRule,
    randomizeLife,
  });

  // Initial state
  refreshDom();
}
