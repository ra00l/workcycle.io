import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from './../../components/button/button.component';

import {Treebeard} from 'react-treebeard';

class MoveToFolder extends Component {
  constructor() {
    super();

    this.state = {data: {}};
    this.onToggle = this.onToggle.bind(this);
  }

  componentWillMount() {
    const {
      subFolders,
      topFolders,
    } = this.props;

    const tree = this.generateTreeView('Root', null, topFolders, subFolders);
    tree.toggled = true;

    this.setState({
      data: tree,
    });
  }

  generateTreeView(name, identifier, topFolders, subFolders) {
    const {folderId} = this.props;
    const tree = {
      name,
      identifier,
      children: [],
    };
    
    topFolders.map((itemId) => {
      if (folderId !== itemId) {
        const folder = subFolders.get(`${itemId}`);

        const treeItem = this.generateTreeView(
          folder.get('name'),
          folder.get('id'),
          folder.get('subFolders'),
          subFolders
        );

        tree.children.push(treeItem);
      }
    });

    return tree;
  }

  onToggle(node, toggled) {
    const {cursor} = this.state;

    if (cursor) {
      cursor.active = false;
    }

    node.active = true;
    if (node.children) {
      node.toggled = toggled;
    }

    this.setState({cursor: node});
  }

  move = () => {
    const {cursor} = this.state;

    if (cursor) {
      this.props.onSaveHandler(cursor.identifier);
    } else {
      this.props.onCancelHandler();
    }
  }

  renderButtons() {
    return (
      <div className="dependency-modal-actions row">
        <div className="col-xs-6 col-sm-6 text-right">
          <Button
            label="Move"
            onClick={this.move}
            type="primary"
          />
        </div>
        <div className="col-xs-6 col-sm-6 text-left">
          <Button
            label="Cancel"
            onClick={() => this.props.onCancelHandler()}
            type="secondary"
          />
        </div>
      </div>
    );
  }

  render() {
    const {data: stateData, cursor} = this.state;
    const style = {
      tree: {
        base: {
          listStyle: 'none',
          backgroundColor: 'transparent',
          margin: 0,
          padding: 0,
          color: '#9DA5AB',
          fontFamily: 'lucida grande ,tahoma,verdana,arial,sans-serif',
          fontSize: '14px',
          display: 'inline-block',
        },
        node: {
          base: {
            position: 'relative',
          },
          link: {
            cursor: 'pointer',
            position: 'relative',
            padding: '0px 5px',
            display: 'block',
          },
          activeLink: {
            background: '#31363F',
            boardRadius: '5px',
          },
          toggle: {
            base: {
              position: 'relative',
              display: 'inline-block',
              verticalAlign: 'top',
              marginLeft: '-5px',
              height: '24px',
              width: '24px',
            },
            wrapper: {
              position: 'absolute',
              top: '50%',
              left: '50%',
              margin: '-7px 0 0 -7px',
              height: '14px',
            },
            height: 14,
            width: 14,
            arrow: {
              fill: '#9DA5AB',
              strokeWidth: 0,
            },
          },
          header: {
            base: {
              display: 'inline-block',
              verticalAlign: 'top',
              color: '#9DA5AB',
            },
            connector: {
              width: '2px',
              height: '12px',
              borderLeft: 'solid 2px black',
              borderBottom: 'solid 2px black',
              position: 'absolute',
              top: '0px',
              left: '-21px',
            },
            title: {
              lineHeight: '24px',
              verticalAlign: 'middle',
            },
          },
          subtree: {
            listStyle: 'none',
            paddingLeft: '19px',
          },
          loading: {
            color: '#E2C089',
          },
        },
      },
    };

    return (
      <div>
        <h4>Move to specific folder</h4>
        <div>Selected folder: <b>{cursor ? cursor.name : 'None'}</b></div>
        <div>
          <Treebeard
            data={stateData}
            onToggle={this.onToggle}
            style={style}
          />
        </div>
        {this.renderButtons()}
      </div>
    );
  }
}

MoveToFolder.defaultProps = {};

MoveToFolder.propTypes = {
  topFolders: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  subFolders: PropTypes.object.isRequired,
  onSaveHandler: PropTypes.func.isRequired,
  onCancelHandler: PropTypes.func.isRequired,
  folderId: PropTypes.number,
};

export default connect((state, props) => {
  const foldersStore = state.folders;

  return {
    topFolders: foldersStore.get('sortedFolders'),
    subFolders: foldersStore.get('data'),
  };
})(MoveToFolder);
