import React from 'react';
import {connect} from 'react-redux';
import {Col, Row} from 'react-bootstrap';
import FieldWrapper from 'common/ui/FieldWrapper';
import SearchDrop from './SearchDrop';

class ProcessRecordPage extends React.Component {
  renderCard(title, children) {
    return (
      <div className="cardWrapper">
        <Row>
          <Col xs={12}>
            <div className="wrapper-header">
              <h2>{title}</h2>
            </div>
            {children}
          </Col>
        </Row>
      </div>
    );
  }


  render() {
    return this.renderCard('Partner Data', ([
      <div className="product-card no-highlight clearfix">
        <FieldWrapper key="partner" label="Partner Organization">
          <SearchDrop
            instance="PARTNER"
            onAdd={obj => obj}
            onSelect={obj => obj}/>
        </FieldWrapper>
      </div>,
      <div className="product-card no-highlight clearfix">
        <FieldWrapper key="contact" label="Contact Search">
          <SearchDrop
            instance="CONTACT"
            onSelect={obj => obj}/>
        </FieldWrapper>
      </div>,
    ]));
  }
}

ProcessRecordPage.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  recordId: React.PropTypes.string.isRequired,
};

export default connect(state => ({
  recordId: state.navigation.currentQuery.id,
}))(ProcessRecordPage);
