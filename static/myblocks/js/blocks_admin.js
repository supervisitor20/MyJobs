var Page = function() {
  this.pageType = null;
  this.name = null;
  this.head = null;
  this.rows = null;
};

Page.prototype = {
  addRow: function(row) {
    if (this.rows === null) {
      this.rows = [];
    }
    this.rows.push(row);
  },
  jsonOutput: function() {
    var rowsData;
    if (this.rows) {
      rowsData = this.rows.map(function(row) {
        return row.jsonOutput();
      });
    } else {
      rowsData = null;
    }

    return {
      pageType: this.pageType,
      name: this.name,
      head: this.head,
      rows: rowsData
    };
  }
};

var page = new Page();

var Row = function() {
  this.blocks = null;
};

Row.prototype = {
  addBlock: function(block) {
    if (this.blocks === null) {
      this.blocks = [];
    }
    this.blocks.push(block);

    this.updateBlockOrder();

    return this;
  },
  jsonOutput: function() {
    var blocksData;

    if (this.blocks) {
      blocksData = this.blocks.map(function(block) {
        return block.jsonOutput();
      });
    } else {
      blocksData = null;
    }

    return {
      blocks: blocksData
    };
  },
  removeBlock: function(block) {
    this.blocks.splice(block.order, 1);

    this.updateBlockOrder();

    if (this.blocks.length === 0) {
      this.blocks = null;
    }

    return this;
  },
  updateBlockOrder: function() {
    $(this.dom).children(".blocks__block").toArray().forEach(function(block, index) {
      findBlockFromDomElement(block).order = index;
    });
  }
};

var Block = function(row) {
  this.row = row;
  this.type = null;
  this.name = null;
  this.offset = null;
  this.span = null;
  this.head = null;
  this.order = 0;

  Block.objects.push(this);
};

Block.objects = [];

Block.prototype = {
  determineOrder: function() {
    this.order = this.row.blocks.indexOf(this);

    return this;
  },
  jsonOutput: function() {
    var returnObj = {};
    if (this.type) {
      returnObj.type = this.type;
    }
    if (this.name) {
      returnObj.name = this.name;
    }
    if (this.offset) {
      returnObj.offset = this.offset;
    }
    if (this.span) {
      returnObj.span = this.span;
    }
    if (this.head) {
      returnObj.head = this.head;
    }
    if (this.order >= 0) {
      returnObj.order = this.order;
    }
    return returnObj;
  },
  updateRow: function(row) {
    this.row = row;

    return this;
  },
  remove: function() {
    Block.objects.splice(Block.objects.indexOf(this), 1);
  }
};

window.onresize = function() {
  updateContainerWidth();
};

jQuery.fn.addDraggable = function() {
  this.draggable({
    handle: '.blocks__block--drag',
    cursor: 'move',
    zIndex: 200,
    opacity: 0.75,
    scroll: false,
    containment: 'window',
    appendTo: document.body,
    connectToSortable: '.blocks--row',
    helper: 'clone'
  });

  return this;
};

jQuery.fn.addRowSortable = function() {
  this.sortable({
    containment: 'window',
    handle: '.blocks__block--wrapper',
    tolerance: 'pointer',
    helper: 'clone',
    connectWith: '.blocks--row',
    placeholder: 'sortable-placeholder',
    receive: function(event, ui) {
      var row = findRowFromDomElement(this),
          block = findBlockFromDomElement(ui.item);
      row.addBlock(block);
      block.updateRow(row);
      updateJsonOutput();
    },
    remove: function(event, ui) {
      var row = findRowFromDomElement(this),
          block = findBlockFromDomElement(ui.item);
      row.removeBlock(block);
      updateJsonOutput();
    },
    stop: function() {
      findRowFromDomElement(this).updateBlockOrder();
      updateJsonOutput();
    },
    start: function(event, ui) {
      var styles = {
        width: ui.item.width(),
        height: ui.item.outerHeight()
      };
      ui.placeholder.css(styles);
    }
  });

  return this;
};

$(document).ready(function() {
  var $blocksContainer = $(".blocks__container");
  addDom(page, $blocksContainer);

  updateJsonOutput();
  updateContainerWidth();

  $("#add-block").on("click", function() {
    $("#add-block-modal").modal('show');
  });

  $("#submit-block").on("click", function() {
    var type = $("#modal--type").val(),
        name = $("#modal--name").val(),
        offset = $("#modal--offset").val(),
        span = $("#modal--span").val(),
        head = $("#modal--head").val();

    if (type === '') {
      $("#modal--type").parent().addClass("has-error");
    } else {
      $("#modal--type").parent().removeClass("has-error");
      generateBlock(type, name, offset, span, head);
      $("#add-block-modal").modal('hide');
    }
  });

  $("#add-row").on("click", function() {
    var $row = $('<div class="blocks--row""></div>'),
        row = new Row();

    $blocksContainer.append($row);
    addDom(row, $row);
    $row.addRowSortable();
    page.addRow(row);
    updateJsonOutput();
  });

  $blocksContainer.on("click", ".blocks--block", function() {
    $blocksContainer.find(".blocks--block.active").removeClass("active");
    $(this).toggleClass("active");
  });

  $("#page--name").on("keyup", function() {
    page.name = $(this).val();
    updateJsonOutput();
  });

  $("#page--head").on("keyup", function() {
    page.head = $(this).val();
    updateJsonOutput();
  });

  $("#page--type").on("change", function() {
    page.pageType = $(this).val();
    updateJsonOutput();
  });
});

function addDom(obj, elementToAdd) {
  obj.dom = elementToAdd[0];

  return obj;
}

function findRowFromDomElement($row) {
  if ($row instanceof jQuery) {
    $row = $row[0];
  }
  
  return page.rows.filter(function(row) {
    return row.dom === $row;
  })[0];
}

function findBlockFromDomElement($block) {
  if ($block instanceof jQuery) {
    $block = $block[0];
  }
  
  return Block.objects.filter(function(block) {
    return block.dom === $block;
  })[0];
}

function buildJson() {
  return page.jsonOutput();
}

function updateJsonOutput() {
  var json = buildJson();
  $(".code").text(JSON.stringify(json));
}

function updateContainerWidth() {
  var $blocksContainer = $(".blocks__container");
  $("#container--width").html($blocksContainer.outerWidth() + "px");
}

function generateBlock(type, name, offset, span, head) {
  var $blocksContainer = $(".blocks__container"),
      $block = $('<div class="blocks__block" style="height: 75px;">' +
                   '<div class="blocks__block--drag"></div>' +
                   '<div class="blocks__block--wrapper"></div>' +
                 '</div>'),
      block,
      $row,
      row;

  if ($blocksContainer.children(".blocks--row").length) {
    $row = $(".blocks--row:first");
    row = findRowFromDomElement($row);
  } else {
    $row = $('<div class="blocks--row"></div>');
    $blocksContainer.append($row);
    row = new Row();
    addDom(row, $row);
    page.addRow(row);
  }
  block = new Block(row);
  block.type = type;
  block.name = name;
  block.offset = offset;
  block.span = span;
  block.head = head;

  $row.append($block).addRowSortable();
  addDom(block, $block);
  $block.addDraggable();
  findRowFromDomElement($row).addBlock(block);
  block.determineOrder();
  updateJsonOutput();
}