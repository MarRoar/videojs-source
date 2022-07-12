/**
 * GUIDs 
 */

const _initialGuid = 3;

let _guid = _initialGuid;

export function newGUID() {
  return _guid++;
}

export function resetGuidInTestsOnly() {
  _guid = _initialGuid;
}
