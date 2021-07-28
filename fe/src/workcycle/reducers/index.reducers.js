/**
 * @description Combine reducers
 * @namespace reduces
 */

import {combineReducers} from 'redux';
import {reducer as formReducer} from 'redux-form'; // redux-form reducer

import alerts from '../modules/alerts/alert.reducers';
import auth from '../modules/auth/auth.reducers';
import board from '../modules/boards/board/board.reducers';
import boards from '../modules/boards/boards.reducers';
import boardFilter from '../modules/boardFilter/boardFilter.reducers';
import company from './../modules/company/company.reducers';
import dashboard from '../modules/dashboard/dashboard.reducers';
import dialog from '../modules/dialog/dialog.reducers';
import fields from '../modules/fields/fields.reducers';
import folders from '../modules/folders/folders.reducers';
import goals from '../modules/goals/goals.reducers';
import initApp from '../modules/initApp/initApp.reducers';
import l10n from '../modules/l10n/l10n.reducers';
import loader from '../modules/loader/loader.reducers';
import nests from '../modules/nests/nests.reducers';
import users from '../modules/users/users.reducers';
import workItem from '../modules/workItems/workItem.reducers';
import workItems from '../modules/workItems/workItems.reducers';

const indexReducers = combineReducers({
  alerts,
  auth,
  board,
  boards,
  boardFilter,
  company,
  dashboard,
  dialog,
  fields,
  folders,
  form: formReducer,
  goals,
  initApp,
  l10n,
  loader,
  nests,
  users,
  workItem,
  workItems,
});

export default indexReducers;
