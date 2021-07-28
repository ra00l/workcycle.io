import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

class FileThumbNail extends Component {

  state = {
    showDeleteModal: false,
  }

  getFileExtension(filename, url) {
    if (filename.lastIndexOf('.') !== -1) {
      return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }

    return url.slice((url.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  getUrlForThumbNail() {
    const {file} = this.props;
    const url = file.get('url');
    const fileName = file.get('name');

    const fileExtension = this.getFileExtension(fileName, url);
    let thumbnail = '';
    let classString = '';

    switch (fileExtension) {
      case 'jpeg':
      case 'jpg':
      case 'png':
      case 'gif':
        thumbnail = url;
        break;

      case 'pdf':
        thumbnail = '/assets/images/pdf.png';
        classString = 'workitem-files-section__files__icon';
        break;

      case 'doc':
      case 'txt':
        thumbnail = '/assets/images/doc.png';
        classString = 'workitem-files-section__files__icon';
        break;

      case 'xls':
      case 'csv':
      case 'xlsx':
        thumbnail = '/assets/images/xls.png';
        classString = 'workitem-files-section__files__icon';
        break;

      default:
        thumbnail = '/assets/images/article.png';
        classString = 'workitem-files-section__files__icon';
        break;
    }

    return {
      file: thumbnail,
      classString,
    };
  }

  deleteFile = (event) => {
    const {file} = this.props;
    event.preventDefault();
    this.setState({showDeleteModal: false});

    this.props.deleteFile(file.get('id'));
  }

  handleClose = () => {
    this.setState({showDeleteModal: false});
  };

  renderDeleteModal() {
    const actions = [
      <FlatButton
        key="0"
        label="Cancel"
        primary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        key="1"
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onClick={this.deleteFile}
      />,
    ];

    return (
      <Dialog
        title="Delete file"
        actions={actions}
        modal={false}
        open={this.state.showDeleteModal}
        onRequestClose={this.handleClose}
      >
        Are you sure that you want to delete this file?
      </Dialog>
    );
  }

  render() {
    const {file} = this.props;
    const url = file.get('url');
    const fileName = file.get('name') || '';
    const thumbnailObj = this.getUrlForThumbNail();
    const styles = {
      backgroundImage: `url(${thumbnailObj.file})`,
      backgroundPosition: 'center center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    };

    let deleteButton = null;
    if (this.props.showDelete !== false) {
      deleteButton = (<span>
        <i
          className="far fa-trash-alt"
          onClick={() => {
            this.setState({showDeleteModal: true});
          }}
        />
      </span>);
    }

    return (
      <div className="workitem-files-section__files thumbnail">
        <a href={url} target="_blank" title={fileName}>
          <img className={thumbnailObj.classString} style={styles}/>
        </a>

        <div className="workitem-files-section__files__actions">
          <span>{fileName}</span>
          {deleteButton}
        </div>

        {this.renderDeleteModal()}
      </div>
    );
  }
}

FileThumbNail.defaultProps = {};

FileThumbNail.propTypes = {
  deleteFile: PropTypes.func.isRequired,
  file: PropTypes.object.isRequired,
  showDelete: PropTypes.bool,
};

export default FileThumbNail;
