// @flow
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import Icon from './Icon';
import { title, body, button } from '../../styles/no-documents.css';
import { activeOpacity } from '../../styles/base.css';

const NoDocuments = ({ onAddDocument }: Object) => (
  <div>
    <h1 className={title}>No Documents</h1>
    <p className={body}>
      Click
      <button
        className={classnames(button, activeOpacity)}
        onClick={onAddDocument}
      >
        <Icon iconName="file" />
        &nbsp;New Document
      </button>
      to get started
    </p>
  </div>
);

NoDocuments.propTypes = {
  onAddDocument: PropTypes.func,
};

export default NoDocuments;
