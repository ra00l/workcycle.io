import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Treebeard} from 'react-treebeard';
import Button from './../../../components/button/button.component';

class CloneBoardModal extends Component {
  constructor() {
    super();
    const boardName = this.props && this.props.boardData.get('name') || 'Board';

    this.state = {
      data: {},
      boardName: `${boardName} clone`,
    };
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

  clone = () => {
    const {cursor, boardName} = this.state;

    if (cursor) {
      this.props.saveHandler(boardName, cursor.identifier);
    } else {
      this.props.saveHandler(boardName, null);
    }
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
      <div className="board-clone">
        <h3>Clone board</h3>

        <p style={{fontSize: '14px'}}>Are you sure you want to clone this board ?</p>

        <div className="form-group" style={{width: '50%'}}>
          <label htmlFor="boardName">Board name (optional)</label>
          <input
            type="text"
            id="boardName"
            value={this.state.boardName}
            className="form-control"
            placeholder="Board name"
            onChange={(evt) => this.setState({boardName: evt.target.value})}
          />
        </div>

        <div>
          <p>Also you can choose the path where to save the new clone (by default will be in the same folder with the board that you are cloning)</p>
          <div>Selected folder: <b>{cursor ? cursor.name : 'None'}</b></div>
          <div>
            <Treebeard
              data={stateData}
              onToggle={this.onToggle}
              style={style}
            />
          </div>
        </div>

        <div className="dependency-modal-actions row">
          <div className="col-xs-6 col-sm-6 text-right">
            <Button
              label="Clone"
              onClick={this.clone}
              type="primary"
            />
          </div>
          <div className="col-xs-6 col-sm-6 text-left">
            <Button
              label="Cancel"
              onClick={() => this.props.cancelHandler()}
              type="secondary"
            />
          </div>
        </div>
      </div>
    );
  }
}

CloneBoardModal.defaultProps = {};

CloneBoardModal.propTypes = {
  boardId: PropTypes.number,
  folderId: PropTypes.number,
  boardData: PropTypes.object,
  dispatch: PropTypes.func,
  saveHandler: PropTypes.func.isRequired,
  cancelHandler: PropTypes.func.isRequired,
  workspaceId: PropTypes.number.isRequired,
  subFolders: PropTypes.object.isRequired,
  topFolders: PropTypes.object.isRequired,
};

export default connect((state, props) => {
  const companyStore = state.company;
  const workspaceId = companyStore && companyStore.lastWorkspace || 0;
  const foldersStore = state.folders;

  return {
    topFolders: foldersStore.get('sortedFolders'),
    subFolders: foldersStore.get('data'),
    workspaceId,
  };
})(CloneBoardModal);
