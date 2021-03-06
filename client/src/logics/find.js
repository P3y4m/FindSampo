import { createLogic } from 'redux-logic';
import axios from 'axios';
import {
  FIND_GET_VALIDATED_FINDS,
  FIND_GET_VALIDATED_SUCCESS,
  FIND_NOTIFICATION_SEND_FAIL,
  FIND_GET_VALIDATED_FIND,
  FIND_GET_VALIDATED_FIND_SUCCESS,
  FIND_GET_VALIDATED_FIND_FAIL

} from '../constants/actionTypes';

const FINDS_END_POINT = '/api/v1/finds';

const getValidatedFinds = createLogic({
  type: FIND_GET_VALIDATED_FINDS,
  latest: true,

  processOptions: {
    dispatchReturn: true,
    successType: FIND_GET_VALIDATED_SUCCESS,
    failType: FIND_NOTIFICATION_SEND_FAIL,
  },

  async process() {
    return await axios.get(FINDS_END_POINT);
  }
});

const getValidatedFind = createLogic({
  type: FIND_GET_VALIDATED_FIND,
  latest: true,

  processOptions: {
    dispatchReturn: true,
    successType: FIND_GET_VALIDATED_FIND_SUCCESS,
    failType: FIND_GET_VALIDATED_FIND_FAIL,
  },

  async process({ action }) {
    return await axios.post(FINDS_END_POINT, { id: action.id });
  }
});

export default [
  getValidatedFinds,
  getValidatedFind
];