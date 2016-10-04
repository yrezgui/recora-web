// @flow
import React from 'react';
import { map } from 'lodash/fp';
import { connect } from 'react-redux';
import { AnimateInOut } from 'state-transitions';
import { Header, HeaderSection } from './Header';
import { StackLink, HorizontalButton } from './HeaderButton';
import HeaderTitle from './HeaderTitle';
import NoDocuments from './NoDocuments';
import DocumentPreview from './DocumentPreview';
import { addDocument } from '../redux';
import { container, containerLeaving } from '../../styles/document-list.css';


const DocumentList = ({
  documents,
  documentTitles,
  documentSections,
  sectionTextInputs,
  addDocument,
}) => {
  let pagePreviews = map(documentId => (
    <DocumentPreview
      key={documentId}
      documentId={documentId}
      title={documentTitles[documentId]}
      sections={documentSections[documentId]}
      sectionTextInputs={sectionTextInputs}
    />
  ), documents);

  if (pagePreviews.length === 0) {
    pagePreviews = <NoDocuments onAddDocument={addDocument} />;
  }

  return (
    <div>
      <Header>
        <HeaderSection place="left">
          <HorizontalButton icon="file" text="New Document" onClick={addDocument} />
        </HeaderSection>
        <HeaderSection place="center">
          <HeaderTitle>Recora</HeaderTitle>
        </HeaderSection>
        <HeaderSection place="right">
          <StackLink icon="help1" text="About" to="/" />
        </HeaderSection>
      </Header>
      <AnimateInOut animateOutClassName={containerLeaving}>
        <div className={container}>
          { pagePreviews }
        </div>
      </AnimateInOut>
    </div>
  );
};

export default connect(
  ({ documents, documentTitles, documentSections, sectionTextInputs }) => ({
    documents,
    documentTitles,
    documentSections,
    sectionTextInputs,
  }),
  { addDocument },
  null,
  { pure: true }
)(DocumentList);
