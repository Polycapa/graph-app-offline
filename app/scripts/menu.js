(function(document) {
  'use strict';

  const remote = require('electron').remote;
  const Menu = remote.Menu;
  const MenuItem = remote.MenuItem;

  var template = [{
    label: 'File',
    submenu: [{
      label: 'Open',
      accelerator: 'CmdOrCtrl+O',
      click: function(item, focusedWindow) {
        document.querySelector('the-graph').openAsJSON();
      }
    },{
      label: 'Save',
      accelerator: 'CmdOrCtrl+S',
      click: function(item, focusedWindow) {
        document.querySelector('the-graph').saveAsJSON();
      }
    }, {
      type: 'separator'
    }, {
      label: 'Export as PNG',
      click: function(item, focusedWindow) {
        document.querySelector('the-graph').saveAsPNG();
      }
    }]
  }, {
    label: 'View',
    submenu: [{
      label: 'Toggle Full Screen',
      accelerator: (function() {
        if (process.platform == 'darwin')
          return 'Ctrl+Command+F';
        else
          return 'F11';
      })(),
      click: function(item, focusedWindow) {
        if (focusedWindow)
          focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
      }
    }]
  }, {
    label: 'Window',
    role: 'window',
    submenu: [{
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    }, {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    }, ]
  }]

  if (process.platform == 'darwin') {
    var name = require('electron').remote.app.getName();
    template.unshift({
      label: name,
      submenu: [{
        label: 'About ' + name,
        role: 'about'
      }, {
        type: 'separator'
      }, {
        label: 'Services',
        role: 'services',
        submenu: []
      }, {
        type: 'separator'
      }, {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      }, {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      }, {
        label: 'Show All',
        role: 'unhide'
      }, {
        type: 'separator'
      }, {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() {
          require('electron').remote.app.quit();
        }
      }, ]
    });
    // Window menu.
    template[3].submenu.push({
      type: 'separator'
    }, {
      label: 'Bring All to Front',
      role: 'front'
    });
  }

  var menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
})(document);
