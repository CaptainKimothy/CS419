//GLOBALS
var APIURL = "https://got-rts.appspot.com"; //"http://httpbin.org/post" // 
var useMin = true; //use minimized images
var fps = 5; //This is just for panning
var level;
var backgroundChange = true;
var panning = false;
var fullOnPanning = false;
var backgroundOffset = {
        "x": 0,
        "y": 0
    } //Offset of map
var panInterval;
var currentCoords = {
        'x': 0,
        'y': 0
    } //Mouse coordinates, these are for panning
var zoom = 1;
var clearBackground = false;
//[x][y] if(p[x][y] == true){alert(something there)}
var blockingTerrain = [];

var firstLoad = true;
var entities = []; //changed from {}
var heroes = []; // Kim added (it seems only square braces work with push)
var enemies = []; // Kim added
var baseN = [];
var baseNHealth = 1000;
var baseS = [];
var baseSHealth = 1000;
//var pathEnd = new Path(0, 0); // Kim added
//var pathStart = new Path(0, 0); // Kim added
//var path = []; // Kim added
var entitySpeed = fps * 2 / 5; // Walking speed of entities
var directions = {
    'S': 0,
    'W': 1,
    'E': 2,
    'N': 3
}
var levelWidth;
var levelHeight;
var zoomHappened = false;
var size = 32; //Tile size is 32 x 32

var pause = false;
var click = false;
var levels = ['theNeck', 'theNorth'];

var quarter = 0;

function drawEntities(entities, heroes, ctx, lock, clear) {

    var scratchCanvas = ctx.canvas.cloneNode();
    scratchCanvas = scratchCanvas.getContext("2d");
    scratchCanvas.canvas.height = levelHeight * 32;
    scratchCanvas.canvas.width = levelHeight * 32;
    //scratchCanvas.clearRect(0, 0, scratchCanvas.canvas.width, scratchCanvas.canvas.height); //may not need

    for (var entity in entities) {

        var img_x = entities[entity].walkingState * entities[entity].size;
        var img_y = directions[entities[entity].directionPointing] * entities[entity].size;
        if (entities[entity].walking == true) {
            if (!lock) {
                entities[entity].walkingState === 0 ? entities[entity].walkingState = 2 : entities[entity].walkingState = 0;
            }
        } else {
            entities[entity].walking.state = 1;
        }

        var x, y;
        x = entities[entity].x;
        y = entities[entity].y;
        if (isBlocked(x, y) === 'wall' || isBlocked(x + 32, y) === 'wall' || isBlocked(x, y + 32) === 'wall' || isBlocked(x + 32, y + 32) === 'wall') {
            scratchCanvas.drawImage(entities[entity].blank, img_x, img_y, entities[entity].size, entities[entity].size, entities[entity].x, entities[entity].y, 32, 32);
        } else {
          
            /*
          if(entities[entity].current === true){  
          	//void ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
	          scratchCanvas.save(); // This drawing if block was lifted from here: http://jsbin.com/ovuret/722/edit?html,js,output with our entities position added
	          scratchCanvas.beginPath();
	          scratchCanvas.ellipse(entities[entity].x + size / 2, entities[entity].y + size * 4/5, 15 * zoom, 10 * zoom, 0, 0, Math.PI*2);
	          scratchCanvas.strokeStyle='red';
	          scratchCanvas.stroke();
	          scratchCanvas.restore();
      } */
      		scratchCanvas.fillStyle = "gray";
      		scratchCanvas.fillRect(entities[entity].x, entities[entity].y - size/ 4, size, size / 13);
            scratchCanvas.fillStyle = "red";
            var health = entities[entity].health;
      		scratchCanvas.fillRect(entities[entity].x + (1 - health / 100) * size, entities[entity].y - size/ 4, (health / 100) * size, size / 13);
            scratchCanvas.drawImage(entities[entity].image, img_x, img_y, entities[entity].size, entities[entity].size, entities[entity].x, entities[entity].y, 32, 32);
        }

        if (!clear) {
            ctx.clearRect(0, 0, $("#background").width(), $("#background").height());
        }

        ctx.drawImage(scratchCanvas.canvas, -backgroundOffset.x, -backgroundOffset.y, $('#background').width() / zoom, $('#background').height() / zoom, 0, 0, $('#background').width(), $('#background').height())

    }

    for (var hero in heroes){
        var img_x = heroes[hero].walkingState * heroes[hero].size;
        var img_y = directions[heroes[hero].directionPointing] * heroes[hero].size;
        if (heroes[hero].walking == true) {
            if (!lock) {
                heroes[hero].walkingState === 0 ? heroes[hero].walkingState = 2 : heroes[hero].walkingState = 0;
            }
        } else {
            heroes[hero].walking.state = 1;
        }

        var x, y;
        x = heroes[hero].x;
        y = heroes[hero].y;
        if (isBlocked(x, y) === 'wall' || isBlocked(x + 32, y) === 'wall' || isBlocked(x, y + 32) === 'wall' || isBlocked(x + 32, y + 32) === 'wall') {
            scratchCanvas.drawImage(heroes[hero].blank, img_x, img_y, heroes[hero].size, heroes[hero].size, heroes[hero].x, heroes[hero].y, 32, 32);
        } else {
          if(heroes[hero].current === true){  
            //void ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
              scratchCanvas.save(); // This drawing if block was lifted from here: http://jsbin.com/ovuret/722/edit?html,js,output with our entities position added
              scratchCanvas.beginPath();
              scratchCanvas.ellipse(heroes[hero].x + size / 2, heroes[hero].y + size * 4/5, 15 * zoom, 10 * zoom, 0, 0, Math.PI*2);
              scratchCanvas.strokeStyle='red';
              scratchCanvas.stroke();
              scratchCanvas.restore();
      }
            scratchCanvas.fillStyle = "gray";
            scratchCanvas.fillRect(heroes[hero].x, heroes[hero].y - size/ 4, size, size / 13);
            scratchCanvas.fillStyle = "green";
            var health = heroes[hero].health;
            scratchCanvas.fillRect(heroes[hero].x + (1 - health / 100) * size, heroes[hero].y - size/ 4, (health / 100) * size, size / 13);
            scratchCanvas.drawImage(heroes[hero].image, img_x, img_y, heroes[hero].size, heroes[hero].size, heroes[hero].x, heroes[hero].y, 32, 32);
        }

        if (!clear) {
            ctx.clearRect(0, 0, $("#background").width(), $("#background").height());
        }

        ctx.drawImage(scratchCanvas.canvas, -backgroundOffset.x, -backgroundOffset.y, $('#background').width() / zoom, $('#background').height() / zoom, 0, 0, $('#background').width(), $('#background').height())

    }

}

$(function() {
    $('#levelButtons').hide();
    $('#signedInNav').hide();
    $('#signInNav').hide();
    $('#menu-toggle').hide();
    $('#cancel').hide();
    // ********** Login Stuff ****************
    $('#cancel').click(function() {
        $('#signInBox').hide();
    })

    if (Cookies.get('loggedIn') === "true") {
        startGame(levels[Cookies.get('level')]);
        $('#signInNav').hide();
        $('#signedInNav').show();
        $('#signedInNav div').text('Signed in as ' + Cookies.get('userName'));

    }
    $('#signIn').click(function() {
        if (checkForm($(this).closest('form'))) {
            var body = {}
            body.uname = $('#userName').val();
            body.password = $('#oldPassword').val();
            $.ajax({
                url: APIURL + '/login',
                method: 'POST',
                //  dataType: 'application/json',
                // contentType:'application/json',
                data: JSON.stringify(body),
                success: function(data, textStatus, res) {
                    //data = JSON.parse(data);
                    console.log('data: ');
                    console.log(data);
                    var headers = res.getAllResponseHeaders();
                    console.log(headers);
                    // Cookies.set('token', auth);
                    console.log(Cookies.get('token'));
                    Cookies.set('userName', data.uname);
                    Cookies.set('level', data.level);
                    Cookies.set('loggedIn', true);
                    $('#signInNav').hide();
                    $('#signedInNav').show();

                    $('#signedInNav div').text('Signed in as ' + data.uname);
                    startGame(levels[data.level]);

                },
                error: function(data, textStatus, res) {
                    console.log("ERROR: ");
                    console.log(data);
                }

            })

        }
        return false;
    })

    $('#signUp').click(function() {
        $('#signInForm').hide();
        $('#signUpForm').show();
        return false;

    })

    $('#signUpSubmit').click(function() {
        if (doubleCheck($(this).closest('form'))) {
            var body = {}
            body.uname = $(newUserName).val();
            body.email = $(newEmail).val();
            body.password = $(newPassword).val();
            $.ajax({
                //contentType: 'application/json',
                url: APIURL + '/register',
                method: 'PUT',
                //  dataType: 'application/json',
                data: JSON.stringify(body),
                success: function(data, textStatus, request) {
                    //  data = JSON.parse(data);
                    //var headers = request.getAllResponseHeaders();
                    //console.log(headers);
                    //Cookies.set('token', headers.authorization);
                    console.log('data: ');
                    console.log(data);
                    //console.log('token: ')
                    //console.log(Cookies.get('token'));
                    Cookies.set('userName', data.uname);
                    Cookies.set('level', data.level);
                    Cookies.set('loggedIn', true);

                    //  $('form').hide();

                    $('#signedInNav').show();
                    $('#signedInNav div').text('Signed in as ' + data.uname);
                    $('#signInForm').show();
                    $('#signUpForm').hide();
                    startGame(levels[data.level]);

                },
                error: function(data, textStatus, request) {
                    console.log('testStatus: ' + textStatus);
                    console.log('request:');
                    console.log(request);
                    console.log("ERROR: ");
                    console.log(data);
                }

            })

        } else {
            console.log('form problem');
        }

        return false;

    });
    $('#skip').click(function() {
        $('form').hide();
        $('#skip').hide();
        $('#levelButtons').show();
        $('#prompt').text('Choose a level');
    })

    // ************End Login

});

// ************** Login functions

function doubleCheck(form) {
    var val = checkForm(form);
    var val2 = matchingPasswords(form);
    return val && val2;
}

function matchingPasswords(form) {
    if ($("#newPassword").val() !== $("#newPasswordAgain").val()) {
        dangerInput($("#newPassword"));
        dangerInput($("#newPasswordAgain"));
        alert("Your passwords don't match");
        return false;
    } else if ($('#newPassword').val()) {
        removeDanger($("#newPassword"));
        removeDanger($("#newPasswordAgain"));
        return true;
    }

}

function checkForm(form) {
    var flag = true;

    form.find('input').each(function() {
        if (!$(this).val()) {
            dangerInput($(this));
            flag = false;
        } else {
            removeDanger($(this));
        }
    })
    return flag;
}

function dangerInput(field) {
    field.closest('.form-group').addClass('has-error');
    field.siblings('span').addClass('glyphicon-remove');
}

function removeDanger(field) {
    field.closest('.form-group').removeClass('has-error');
    field.siblings('span').removeClass('glyphicon-remove');
}

function blank(field) {
    alert($())
}
// End Login functions

function startGame(userLevel) {
    level = userLevel;

    $("#signInBox").hide();

    $("#background").fadeTo(100, 1, function() {
        $("#foreground").fadeTo(1, 1, function() {
            startLevel();
        });

    });

}
//Loading tiled maps***
//Help from this tutorial: https://hashrocket.com/blog/posts/using-tiled-and-canvas-to-render-game-screens
var scene = {
    zoom: 1,
    tileSets: [],
    context: "",
    layers: [],

    renderLayer: function(layer) {

        if (layer.type !== 'tilelayer' || !layer.opacity) {
            console.log("Error Loading: Not a visible tile layer");
        }
        var scratchCanvas = scene.context.canvas.cloneNode();
        var size = scene.data.tilewidth;
        scratchCanvas = scratchCanvas.getContext("2d");
        //console.log(scratchCanvas.canvas);
        scratchCanvas.canvas.height = layer.height * size;
        scratchCanvas.canvas.width = layer.width * size;
        //console.log(scratchCanvas.canvas.height);
        //   console.log(scratchCanvas.canvas);

        if (layer.name === 'BaseS' && firstLoad) {
            levelWidth = layer.width;
            levelHeight = layer.height;
            if (levelWidth * size < window.innerWidth) {
                backgroundOffset.x = window.innerWidth - levelWidth * size
            }; //fixes window too wide bug
            blockingTerrain = new Array(layer.width);
            for (var i = 0; i < layer.width; i++) {
                blockingTerrain[i] = new Array(layer.height);
                blockingTerrain[i].fill(false);
            }
        }

        if (firstLoad) { //first fill up the array of scratch canvas's, then use later

            layer.data.forEach(function(tile_idx, i) {

                if (tile_idx === 0) {
                    return;
                } //tile_idx is the id of the specific tile given by Tiled

                var img_x, img_y, s_x, s_y; //nice description of these variables: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage

                var tile = -1;
                var tileSetIndex = 0;
                for (tileSetIndex; tileSetIndex < scene.data.tilesets.length - 1; tileSetIndex++) {
                    if (tile_idx >= scene.data.tilesets[tileSetIndex].firstgid && tile_idx < scene.data.tilesets[tileSetIndex + 1].firstgid) {
                        tile = scene.data.tilesets[tileSetIndex];
                        break;
                    }
                }
                if (tile === -1) {
                    tile = scene.data.tilesets[tileSetIndex];
                }
                tile_idx = tile_idx - tile.firstgid;

                img_x = (tile_idx % (tile.imagewidth / size)) * size; //pinpoint tile on x, y matrix tilesheet
                img_y = ~~(tile_idx / (tile.imagewidth / size)) * size; //Math.floor avoids floating point blurryness, can use fancy ~~ instead

                s_x = (i % layer.width) * size;
                s_y = (~~(i / layer.width) * size);

                //I beleive s_x, s_y is the upper left corner of a tile, so if it is in layer > 0 (check this), then
                //s_x to s_x - size and s_y to s_y - size should be added to terrain array

                if (layer.name !== 'Bottom' && layer.name !== 'Bridges' && firstLoad) {
                    if (layer.name === 'Top') {
                        blockingTerrain[(i % layer.width)][~~(i / layer.width)] = 'wall';
                    } else if (layer.name === 'BaseS') {
                        blockingTerrain[(i % layer.width)][~~(i / layer.width)] = 'BaseS';
                    } else if (layer.name === 'BaseN') {
                        blockingTerrain[(i % layer.width)][~~(i / layer.width)] = 'BaseN';
                    } else {
                        if (blockingTerrain[(i % layer.width)][~~(i / layer.width)] === false) {
                            blockingTerrain[(i % layer.width)][~~(i / layer.width)] = true;
                        }
                    }
                }

                //  if(s_x > $('#background').width() || s_y > $('#background').height()){return;} //outside current window, don't load

                scratchCanvas.drawImage(scene.tileSets[tileSetIndex], img_x, img_y, size, size, s_x, s_y, size, size);

            });

            //scene.layers.push(scratchCanvas.canvas.toDataURL()); //save scratch canvas for later
            scene.layers.push(scratchCanvas.canvas);
            scene.context.drawImage(scratchCanvas.canvas, -backgroundOffset.x, -backgroundOffset.y, $('#background').width() / scene.zoom, $('#background').height() / scene.zoom, 0, 0, $('#background').width(), $('#background').height()); //draw image from scratch canvas for better performance

        } else { //if all the layers have been previously loaded, use the cache

            scene.layers.forEach(function(layer) {
                backgroundOffset.x > 0 ? backgroundOffset.x = 0 : backgroundOffset.x; //Make sure not to pan outside of map
                backgroundOffset.y > 0 ? backgroundOffset.y = 0 : backgroundOffset.y;
                (layer.width + backgroundOffset.x) / scene.zoom < $('#background').width() ? backgroundOffset.x = $('#background').width() * scene.zoom - layer.width : backgroundOffset.x;
                (layer.height + backgroundOffset.y) / scene.zoom < $('#background').height() ? backgroundOffset.y = $('#background').height() * scene.zoom - layer.height : backgroundOffset.y;
                //var i = $("<img />", {src: src})[0];
                // console.log(layer);
                scene.context.drawImage(layer, -backgroundOffset.x, -backgroundOffset.y, $('#background').width() * scene.zoom, $('#background').height() * scene.zoom, 0, 0, $('#background').width(), $('#background').height()); //draw image from scratch canvas for better performance
            });
        }
    },

    renderLayers: function(layers) {
        layers = $.isArray(layers) ? layers : scene.data.layers; //can pass an array of layers
        layers.forEach(scene.renderLayer);
        firstLoad = false;
    },

    loadTileset: function(json) {
        this.data = json;

        var itemsProcessed = 0;
        json.tilesets.forEach(function(item, index) { //does this give the images enough time to load?
            scene.tileSets[index] = new Image();
            if (useMin) {
                var imageAddr = item.image;
                imageAddr = imageAddr.slice(0, -4); //Only if all images are .png, which they are...
                imageAddr += '-min.png';
                scene.tileSets[index].src = imageAddr;
            } else {
                scene.tileSets[index].src = item.image;
            }

            (scene.tileSets[index]).onload = function() {
                itemsProcessed++;
                if (itemsProcessed === json.tilesets.length) {
                    scene.renderLayers(this);
                }
            };
        });

    },

    load: function(name, ctx, zoom) {
        if (clearBackground) {
            clearBackground = false;
            ctx.clearRect(0, 0, $("#background").width(), $("#background").height());
        }

        scene.zoom = 1 / zoom;
        scene.context = ctx;

        if (firstLoad) {
            $.getJSON("js/maps/" + name + ".json", function(json) {
                    //this.data = json;
                    scene.data = json;
                    scene.loadTileset(scene.data);
                }) //.fail(alert("aweful things have happend"));
        } else {
            scene.loadTileset(scene.data);
        }

    }
}

$("#gameContainer").on('mousedown', function(e) {
    pressMap(e)
}).on('mouseup', function(e) {
    releasePressMap(e)
}).on('mousemove', function(e) {
    mapMove(e);
});
$("#gameContainer").on('touchstart', function(e) {
    pressMap(e, true)
}).on('touchend', function(e) {
    releasePressMap(e, true)
}).on('touchmove', function(e) {
    mapMove(e, true);
    return false;
});

function mapMove(e, mobile) {
    if (mobile) {
        e = e.touches[0];
    }
    var changeX = Math.abs(e.clientX - currentCoords.x);
    var changeY = Math.abs(e.clientY - currentCoords.y);

    if (!panning) {
        fullOnPanning = false;
    }

    if ((panning && (changeY > 5 || changeX > 5)) || fullOnPanning) {
        click = false;
        backgroundOffset.x += e.clientX - currentCoords.x;
        backgroundOffset.y += e.clientY - currentCoords.y;
        // backgroundChange = true;

        currentCoords.x = e.clientX;
        currentCoords.y = e.clientY;
        if ($('#gameContainer').css('cursor') != 'move') {
            $('#gameContainer').css('cursor', 'move');
        }
        fullOnPanning = true;

    } else {
        click = true;
    }

}

function releasePressMap(e, mobile) {
    panning = false;
    fullOnPanning = false;

    $('#gameContainer').css('cursor', 'auto');

}

function pressMap(e, mobile) {
    if (mobile) {
        e = e.touches[0];
    }
    currentCoords.x = e.clientX;
    currentCoords.y = e.clientY;
    //console.log(isBlocked(~~((currentCoords.x - backgroundOffset.x) / zoom),
    //~~((currentCoords.y - backgroundOffset.y) / zoom)));
    panning = true;
}

function zoomIn() {
    zoom = zoom + .25;
    zoomHappened = true;
    clearBackground = true;
}

function zoomOut() {
    zoom = zoom - .25;
    zoomHappened = true;
    clearBackground = true;
}

$("#zoomIn").click(function() {
    zoomIn();
    return false;
});

$("#zoomOut").click(function() {
    zoomOut();
    return false;
});

//IMPORTANT: if you want to convert a event.clientX or Y to work with isBlocked, do this:
//** This is a little off when zoomed in, look into the math eventually if needs be, probably won't need to
//   x = ~~((x - backgroundOffset.x) / zoom); //where 32 is the size of a tile, consistent for our applications
//   y = ~~((y - backgroundOffset.y) / zoom);

function isBlocked(x, y) {

    return blockingTerrain[~~(x / 32)][~~(y / 32)];

}

//End loading tiled maps

function startLevel() {
    $('#menu-toggle').show();
    if (!Cookies.get('loggedIn')) {
        $('#signInNav').show();
    }

    var mapHeight, mapWidth, canvasHeight, canvasWidth, mapYOffset, mapXOffset;

    $("#background").attr("height", $("#gameContainer").height());
    $("#background").attr("width", $("#gameContainer").width());
    $("#foreground").attr("height", $("#gameContainer").height());
    $("#foreground").attr("width", $("#gameContainer").width());
    var ctxB = $("#background")[0].getContext("2d");
    var ctxF = $("#foreground")[0].getContext("2d");

    // add all heroes with full health
    var hero1 = new Entity({'x': 384, 'y': 1720}, "img/characters/soldier.png", 100);
    heroes.push(hero1);
    var hero2 = new Entity({'x': 853, 'y': 1740}, "img/characters/soldier.png", 100);
    heroes.push(hero2);
    var hero3 = new Entity({'x': 426, 'y': 1726}, "img/characters/soldier.png", 100);
    heroes.push(hero3);
    var hero4 = new Entity({'x': 942, 'y': 1799}, "img/characters/soldier.png", 100);
    heroes.push(hero4);
    var hero5 = new Entity({'x': 744, 'y': 1918}, "img/characters/soldier.png", 100);
    heroes.push(hero5);
    var hero6 = new Entity({'x': 1028, 'y': 1736}, "img/characters/soldier.png", 100);
    heroes.push(hero6);
    var hero7 = new Entity({'x': 1000, 'y': 1752}, "img/characters/soldier.png", 100);
    heroes.push(hero7);
    var hero8 = new Entity({'x': 1010, 'y': 1860}, "img/characters/soldier.png", 100);
    heroes.push(hero8);
    var hero9 = new Entity({'x': 900, 'y': 1989}, "img/characters/soldier.png", 100);
    heroes.push(hero9);
    var hero10 = new Entity({'x': 1017, 'y': 1800}, "img/characters/soldier.png", 100);
    heroes.push(hero10);
    var hero11 = new Entity({'x': 1000, 'y': 1984}, "img/characters/soldier.png", 100);
    heroes.push(hero11);
    var hero12 = new Entity({'x': 547, 'y': 1840}, "img/characters/soldier.png", 100);
    heroes.push(hero12);
    var hero13 = new Entity({'x': 840, 'y': 1920}, "img/characters/soldier.png", 100);
    heroes.push(hero13);
    var hero14 = new Entity({'x': 920, 'y': 1890}, "img/characters/soldier.png", 100);
    heroes.push(hero14);
    var hero15 = new Entity({'x': 730, 'y': 1820}, "img/characters/soldier.png", 100);
    heroes.push(hero15);
    var hero16 = new Entity({'x': 682, 'y': 1904}, "img/characters/soldier.png", 100);
    heroes.push(hero16);
    var hero17 = new Entity({'x': 600, 'y': 1970}, "img/characters/soldier.png", 100);
    heroes.push(hero17);
    var hero18 = new Entity({'x': 534, 'y': 1980}, "img/characters/soldier.png", 100);
    heroes.push(hero18);
    var hero19 = new Entity({'x': 500, 'y': 1976}, "img/characters/soldier.png", 100);
    heroes.push(hero10);
    var hero20 = new Entity({'x': 472, 'y': 1976}, "img/characters/soldier.png", 100);
    heroes.push(hero20);


    //add all enemies
    var entity1 = new Entity({'x': 100, 'y': 50}, "img/characters/giant.png", 100);
    entities.push(entity1);
    var entity2 = new Entity({'x': 200, 'y': 60}, "img/characters/giant.png", 100);
    entities.push(entity2);
    var entity3 = new Entity({'x': 300, 'y': 412}, "img/characters/giant.png", 100);
    entities.push(entity3);
    var entity4 = new Entity({'x': 400, 'y': 601}, "img/characters/giant.png", 100);
    entities.push(entity4);
    var entity5 = new Entity({'x': 500, 'y': 360}, "img/characters/giant.png", 100);
    entities.push(entity5);
    var entity6 = new Entity({'x': 600, 'y': 160}, "img/characters/giant.png", 100);
    entities.push(entity6);
    var entity7 = new Entity({'x': 700, 'y': 540}, "img/characters/giant.png", 100);
    entities.push(entity7);
    var entity8 = new Entity({'x': 800, 'y': 290}, "img/characters/giant.png", 100);
    entities.push(entity8);
    var entity9 = new Entity({'x': 900, 'y': 200}, "img/characters/giant.png", 100);
    entities.push(entity9);
    var entity10 = new Entity({'x': 1000, 'y': 630}, "img/characters/giant.png", 100);
    entities.push(entity10);
    /*
    var entity11 = new Entity({'x': 1100, 'y': 190}, "img/characters/giant.png", 100);
    entities.push(entity11);
    var entity12 = new Entity({'x': 1200, 'y': 500}, "img/characters/giant.png", 100);
    entities.push(entity12);
    var entity13 = new Entity({'x': 150, 'y': 375}, "img/characters/giant.png", 100);
    entities.push(entity13);
    var entity14 = new Entity({'x': 250, 'y': 315}, "img/characters/giant.png", 100);
    entities.push(entity14);
    var entity15 = new Entity({'x': 350, 'y': 615}, "img/characters/giant.png", 100);
    entities.push(entity15);
    var entity16 = new Entity({'x': 450, 'y': 250}, "img/characters/giant.png", 100);
    entities.push(entity16);
    var entity17 = new Entity({'x': 550, 'y': 480}, "img/characters/giant.png", 100);
    entities.push(entity17);
    var entity18 = new Entity({'x': 650, 'y': 420}, "img/characters/giant.png", 100);
    entities.push(entity18);
    var entity19 = new Entity({'x': 750, 'y': 180}, "img/characters/giant.png", 100);
    entities.push(entity19);
    var entity20 = new Entity({'x': 850, 'y': 120}, "img/characters/giant.png", 100);
    entities.push(entity20);
    */
    /* //too many monsters to process! 
    var entity21 = new Entity({'x': 950, 'y': 300}, "img/characters/giant.png", 100);
    entities.push(entity21);
    var entity22 = new Entity({'x': 1050, 'y': 330}, "img/characters/giant.png", 100);
    entities.push(entity22);
    var entity23 = new Entity({'x': 1150, 'y': 620}, "img/characters/giant.png", 100);
    entities.push(entity23);
    var entity24 = new Entity({'x': 1250, 'y': 400}, "img/characters/giant.png", 100);
    entities.push(entity24);
    var entity25 = new Entity({'x': 1350, 'y': 100}, "img/characters/giant.png", 100);
    entities.push(entity25);
    var entity26 = new Entity({'x': 580, 'y': 75}, "img/characters/giant.png", 100);
    entities.push(entity26);
    var entity27 = new Entity({'x': 620, 'y': 580}, "img/characters/giant.png", 100);
    entities.push(entity27);
    var entity28 = new Entity({'x': 735, 'y': 600}, "img/characters/giant.png", 100);
    entities.push(entity28);
    var entity29 = new Entity({'x': 818, 'y': 645}, "img/characters/giant.png", 100);
    entities.push(entity29);
    var entity30 = new Entity({'x': 1348, 'y': 50}, "img/characters/giant.png", 100);
    entities.push(entity30);
    */

    // make entities go south
    console.log(entities.length);
    for (var i = 0; i < entities.length; i++){
        travelSouth(entities[i]);
    }

    // create array for baseN
    for (var i = 0; i < blockingTerrain.length; i++) {
        for (var j = 0; j < blockingTerrain[i].length; j++){
            if(blockingTerrain[i][j] === 'baseN'){
                var t = new Path(i, j); // blockingTerrain[i];
                baseN[t.x][t.y] = Number.MAX_VALUE;
            }
        }
    }

    // create array for baseS
    for (var i = 0; i < blockingTerrain.length; i++) {
        for (var j = 0; j < blockingTerrain[i].length; j++){
            if(blockingTerrain[i][j] === 'baseS'){
                var t = new Path(i, j); // blockingTerrain[i];
                baseS[t.x][t.y] = Number.MAX_VALUE;
            }
        }
    }

    $('#gameContainer').click(function(e) {
        if (click) {

            var x = ~~(e.offsetX / zoom - backgroundOffset.x);
            var y = ~~(e.offsetY / zoom - backgroundOffset.y);
            console.log(x);
            console.log(y);
            console.log(get_current_hero())



            for (var h = 0; h < heroes.length; h++){ // changed heroes to entities
                if (~~(heroes[h].x / 32) === ~~(x / 32) && ~~(heroes[h].y / 32) === ~~(y / 32)){  //  was ~~(x / 32) changed heroes -> entities
                    if(get_current_hero != "None"){
                        var oldHero = get_current_hero();
                        oldHero.current = false;
                    }
                    var oldHero = get_current_hero();
                    oldHero.current = false;
                    heroes[h].current = true;
                }
            }


            var attacking;
            if (get_current_hero() != "None"){ // changed != to !==
                var curHero = get_current_hero();
                for (var h = 0; h < entities.length; h++){ 
                    if (~~(entities[h].x / 32) === ~~(x / 32) && ~~(entities[h].y / 32) === ~~(y /32)){  
                        curHero.dest.x = ~~(entities[h].x / 32);
                        curHero.dest.y = ~~(entities[h].y / 32);
                        attacking = "h";
                        move(curHero, entities[h], attacking);
                    }
                }
                // math here? is base big or small x?
                for (var b = 0; b < baseN.length; b++){
                    if (~~(baseN[b].x / 32) === ~~(x / 32) && ~~(baseN[b].y / 32) === ~~(y /32)){  
                        curHero.dest.x = baseN[b].x;
                        curHero.dest.y = baseN[b].y;
                        attacking = "b";
                        move(curHero, baseN[b], attacking);
                    }
                }
                curHero.dest.x = x;
                curHero.dest.y = y;
                attacking = "h";
                move(curHero, null, attacking);

            }   
            /* 
           else{
                for (var h = 0; h < heroes.length; h++){ // changed heroes to entities
                    if (~~(heroes[h].x / 32) === ~~(x / 32) && ~~(heroes[h].y / 32) === ~~(y / 32)){  //  was ~~(x / 32) changed heroes -> entities
                        var oldHero = get_current_hero();
                        oldHero.current = false;
                        heroes[h].current = true;
                    }
                }
            } */

            /*
            var entity;
            if (Math.floor(Math.random() * 2) === 0) { //50 50 chance
                entity = new Entity({
                    'x': x,
                    'y': y
                }, "img/characters/giant.png", 75);
            } else {
                entity = new Entity({
                    'x': x,
                    'y': y
                }, "img/characters/soldier.png", 25);
            }
            entities[entity.id] = entity;
            travelSouth(entity);
            */

        } else click = false;

    })

    var i = 0;
    ctxB.imageSmoothingEnabled = false; //supposedly this should optimize graphics

    scene.load(level, ctxB, zoom);
    // backgroundChange = false;

    var entityTrack = 0;
    var entityOnBackground = false;
    var clearedF = false;

    setInterval(function() {
        entityTrack++;
        // limitBackgroundOffset();
        if (fullOnPanning || zoomHappened) {
            if (fullOnPanning) {
                pause = true;
                if (!clearedF) {
                    ctxF.clearRect(0, 0, ctxF.canvas.width, ctxF.canvas.height);
                    clearedF = true;
                }
                scene.load(level, ctxB, zoom)
                drawEntities(entities, heroes, ctxB, true, true);
            } else if (zoomHappened) {
                scene.load(level, ctxB, zoom);
                drawEntities(entities, heroes, ctxF, true);
                zoomHappened = false;
            }

            // backgroundChange = false;
        } else if (entityTrack % entitySpeed === 0) { //simple way to animate entities, should be a better way (else if, entities are frozen when pan)
            drawEntities(entities, heroes, ctxF);
            /*drawEntities(entities.slice(quarter/ 4 * entities.length, (quarter + 1)/4 * entities.length - 1), ctxF);
            quarter++;  //Ugg this would work if enties was an array, need to convert to array then back to object or reconfigure project var myarray = Array.prototype.slice.call(myobject, 1) 
            quarter %= 4;*/
        } else {

            clearedF = false;
            pause = false
        }

    }, 1000 / fps);
}

/*function drawEntityOnBackground(ctxF, ctxB, topBackgroundctx){
  console.log('topBW: ' + topBackgroundctx.width);
  var scratch = topBackgroundctx.cloneNode();
  scratch = scratch.getContext("2d");
  console.log('scratchW: ' + scratch.canvas.width);
  
  scratch.canvas.width = topBackgroundctx.width;
  scratch.canvas.height = topBackgroundctx.height;
  
  scratch.drawImage(topBackgroundctx, 0, 0);

  drawEntities(entities, scratch);
  scene.layers[scene.layers.length - 1] = scratch.canvas;
  
  ctxF.clearRect(0, 0, ctxF.canvas.width, ctxF.canvas.height);
  return topBackgroundctx;
}*/
function eraseEntityOnBackground(oldTop) {
    scene.layers[scene.layers.length - 1] = oldTop;
}

//I don't this limit  background is currently being used
function limitBackgroundOffset() {
    backgroundOffset.x > 0 ? backgroundOffset.x = 0 : backgroundOffset.x; //Make sure not to pan outside of map
    backgroundOffset.y > 0 ? backgroundOffset.y = 0 : backgroundOffset.y;
    (levelWidth + backgroundOffset.x) * zoom < $('#background').width() ? backgroundOffset.x = $('#background').width() / zoom - levelWidth : backgroundOffset.x;
    (levelHeight + backgroundOffset.y) * zoom < $('#background').height() ? backgroundOffset.y = $('#background').height() / zoom - levelHeight : backgroundOffset.y;

}

/***************** Entities Start Here ***************************************/

function Entity(xyStart, png, health) {
    this.x = xyStart.x;
    this.y = xyStart.y;
    this.png = png;
    this.health = health;
    this.directionPointing = 'E'; //N, W, E, S
    this.heading = {};
    this.heading.x = this.x;
    this.heading.y = this.y;
    this.action = 'defending'; //attacking, defending
    this.walking = true;
    this.walkingState = '0';
    this.alreadyBeen = [];
    this.alreadyBeen[this.x] = [];
    this.alreadyBeen[this.x][this.y] = true;
    this.size = 150;
    this.image = new Image();
    this.blank = new Image();
    this.blank.src = 'img/characters/blank.png'
    this.image.src = png;
    this.loaded = false;
    this.team = 'red'; // red or blue
    this.ai = false;
    // kim added
    this.current = false;
    this.fighting = false;
    this.pathStart = {};
    this.pathStart.x = 0;
    this.pathStart.y = 0;
    this.dest = [];
    this.dest.x = 0;
    this.dest.y = 0;
    this.dest.distance = 0;
    this.pathDist = 0;
    this.path = [];
    this.dijkstraGrid = []; 

    this.image.onload = function() {
        this.loaded = true;
    }
    for (var i = 0; i < 1000; i++) {
        if (!entities[i]) {
            this.id = i;
            break;
        }
    }

};

/*
var giant = new Entity({'x': 150, 'y':0}, "img/characters/giant.png", 100);
var giant2 = new Entity({'x': 0, 'y':0}, "img/characters/giant.png", 100);
var giant3 = new Entity({'x': 0, 'y':100}, "img/characters/giant.png", 100);
var giant4 = new Entity({'x': 100, 'y':800}, "img/characters/giant.png", 100);

entities[giant.id] = giant;  //Why am I storing these in an object and not an array, probably should fix that, how else .push, maybe give
        //each entity a unique id?
entities[giant2.id] = giant2;
entities[giant3.id] = giant3;
entities[giant4.id] = giant4;*/

/*function walkAbout(entity){
  var spin = 0;
  setInterval(function(){
    spin++;
    entity.x += 5;
    entity.y += 5;
    while(isBlocked(entity.x, entity.y) || isBlocked(entity.x + 32, entity.y) || isBlocked(entity.x, entity.y + 32) || isBlocked(entity.x + 32, entity.y + 32)){
      entity.y+=5;
    }
    if(spin % 20 === 0){
      entity.directionPointing === 'E' ? entity.directionPointing = 'S' : entity.directionPointing = 'E';
    }
  }, 1000)
}*/

function travelSouth(entity) {

    entity.heading.y = entity.y + 1000;
    var tid; 
    function walkSouth () { //setInterval(function() {
        if (!pause && entity.fighting === false) {
            // check if they are close enough to battle something
            checkRange(null, entity);
            if (shouldGoThere(entity.x, entity.y + 5, entity)) {
                addAlreadyBeen(entity);
                entity.y += 5;
                entity.directionPointing = 'S';

            } else if (shouldGoThere(entity.x + 5, entity.y, entity)) {
                addAlreadyBeen(entity);
                entity.x += 5;
                entity.directionPointing = 'E';
            } else if (shouldGoThere(entity.x, entity.y - 5, entity)) {
                addAlreadyBeen(entity);
                entity.y -= 5;
                entity.directionPointing = 'N';
            } else if (shouldGoThere(entity.x - 5, entity.y, entity)) {
                addAlreadyBeen(entity);
                entity.x -= 5;
                entity.directionPointing = 'W';
            }
           
        }
    } tid = setInterval(walkSouth, 250); //, 250)
}

function addAlreadyBeen(entity) {
    if (!entity.alreadyBeen[entity.x]) {
        entity.alreadyBeen[entity.x] = [];
    }
    entity.alreadyBeen[entity.x][entity.y] = true;
}

function entityIsBlocked(x, y) {
    if (isBlocked(x, y) === true || isBlocked(x + 16, y) === true || isBlocked(x, y + 16) === true || isBlocked(x + 16, y + 16) === true) {
        return true;
    }
    return false;
}

function shouldGoThere(x, y, entity) {
    return (entityIsBlocked(x, y) !== true && (typeof entity.alreadyBeen[x] == 'undefined' || typeof entity.alreadyBeen[x][y + 5] == 'undefined'));
}

function logOut() {
    Cookies.set('loggedIn', false);
    $('#signedInNav').hide();
    $('#signInNav').show();
}

function signInNav() {
    $('#signInBox').show();
    $('#levelButtons').hide();
    $('#signUpForm').hide()
    $('#signInForm').show();
    $('#prompt').text('Sign In');
    $('#skip').hide();
    $('#cancel').show();
}

$('#signOut').click(function() {
    logOut();
    return false;
});

$('#signInNav').click(function() {
    signInNav();
    return false;
})

function saveGame() {
    var state = {};
    for (var entity in entities) {
        entities[entity].alreadyBeen = [];
    }

    state['entities'] = entities;
    var player1 = {};
    player1.gold = 300;
    player1.team = 'red';
    player1.ai = true;
    player1.name = "player1"
    var player2 = {};
    player2.gold = 200;
    player2.team = 'blue';
    player2.ai = false;
    player2.name = 'player2';
    var players = [player1, player2];
    state['players'] = players;
    state['level'] = level;
    return state;

}

function checkRange(hero, enemy, base, enemyTarget) { //check on all(current)? or track?
    // 
    if (hero === null){
        //for (var i = 0; i < entities.length; i++){
            if(enemyTarget === null){
                var attacking;
                for (var j =0; j < heroes.length; j++){
                    if ((enemy.x >= (heroes[j].x - 10)) && (enemy.x <= (heroes[j].x + 10)) && (enemy.y >= (heroes[j].y - 10)) && (enemy.y <= (heroes[j].y + 10))){
                        enemy.fighting = true;
                        console.log("Enemy Attacks Hero");
                        attack(heroes[j], enemy, null);
                    }
                     else if ((enemy.x >= (heroes[j].x - 200)) && (enemy.x <= (heroes[j].x + 200)) && (enemy.y >= (heroes[j].y - 150)) && (enemy.y <= (heroes[j].y + 150))){
                        console.log("Enemy moves to Hero");
                        enemy.fighting = true;
                        attacking = "e";
                        move(heroes[j], enemy, attacking);
                    }
                }
                for (var j =0; j < baseS.length; j++){
                    if ((enemy.x >= (baseS[j].x - 10)) && (enemy.x <= (baseS[j].x + 10)) && (enemy.y >= (baseS[j].y - 10)) && (enemy.y <= (baseS[j].y + 10))){
                        console.log("Enemy Attacks Base");
                        enemy.fighting = true;
                        attack(null, enemy, baseSHealth);
                    }
                    else if ((enemy.x >= (baseS[j].x - 200)) && (enemy.x <= (baseS[j].x + 200)) && (enemy.y >= (enemy.y - 150)) && (enemy.y <= (baseS[j].y + 150))){
                        console.log("Enemy moves to Base");
                        enemy.fighting = true;
                        attacking = e;
                        move(baseS[j], enemy, attacking);
                    }
                }
            }
            else{
                var attacking;
                
                if ((enemy.x >= (enemyTarget.x - 10)) && (enemy.x <= (enemyTarget.x + 10)) && (enemy.y >= enemyTarget.y - 10)) && (enemy.y <= (enemyTarget.y + 10))){
                    enemy.fighting = true;
                    console.log("Enemy Attacks Hero");
                    attack(enemyTarget, enemy, null);
                }
                 else if ((enemy.x >= (enemyTarget.x - 200)) && (enemy.x <= (enemyTarget.x + 200)) && (enemy.y >= (enemyTarget.y - 150)) && (enemy.y <= (enemyTarget.y + 150))){
                    console.log("Enemy moves to Hero");
                    enemy.fighting = true;
                    attacking = "e";
                    move(enemyTarget, enemy, attacking, enemyTarget);
                }
            
            

            }
        //} 
    }   
    else{
    //or (var i = 0; i < entities.length; i++){
        //for (var j =0; j < baseS.length; j++){
        // if enemy was clicked to attack, pathEnd will be set to enemy's location
        var attacking;
        if (base === null){
            if ((hero.x >= (enemy.x - 10)) && (hero.x <= (enemy.x + 10)) && (hero.y >= (enemy.y - 10)) && (hero.y <= (enemy.y + 10))){
                    console.log("Hero Attacks Enemy");
                    hero.fighting = true;
                    attack(hero, enemy, null);
            }
            else {
                //update hero destination to be new enemy location
                // call move again with new information
                console.log("Hero Moves to Enemy");
                hero.dest.x = enemy.x;
                hero.dest.y = enemy.y;
                attacking = "h";
                move(hero, enemy, attacking);

            }
        } 
        else{
            if ((hero.x >= (hero.dest.x - 10)) && (hero.x <= (hero.dest.x + 10)) && (hero.y >= (hero.dest.y - 10)) && (hero.y <= (hero.dest.y + 10))){
                    ("Hero Attacks Base");
                    hero.fighting = true;
                    attack(hero, null, baseNHealth);
            }
        }
        //}
    //}
    }
   
    /*
     for (var i = 0; i < heroes.length; i++){
        for (var j =0; j < baseN.length; j++){
            if ((heroes[i].x >= (baseN[j].x - 50)) && (heroes[i].x <= (baseN[j].x + 50)) && (heroes[i].y >= (baseN[j].y - 50)) && (heroes[i].y <= (baseN[j].y + 50))){
                attack(null, heroes[i], baseNHealth);
            }
        }
    }   */
    return;
}

function attack(hero, enemy, base){ //changed here<->enemy, need to update
    if (base === null){
        enemy.fighting = true;


        var fid;
        function fight() { 
            var heroAttack = Math.random() * (11 - 1) + 1;
            if (heroAttack >= 5) {
                enemy.health -= 20;
            }
            var enemyAttack = Math.random() * (15 - 1) + 1;
            if(enemy.health > 0 &&  enemyAttack) {
                hero.health -= 10;
            }

            if (!(!gameOver() && hero.health > 0 && enemy.health > 0)){
                clearInterval(fid);
            }
        } tid = setInterval(fight, 250);

        
        if (hero.health <= 0){
            var index = heroes.indexOf(hero);
            if (index > -1){
                heroes.splice(index, 1);
            }
            enemy.fighting = false;
            travelSouth(enemy);
        }
        if (enemy.health <= 0){
            var index = entities.indexOf(enemy);
            if (index > -1){
                entities.splice(index, 1);
            }
        }

    }
    else if (enemy === null) {
        hero.fighting = true;
        var nid;
        function baseNAttack () { {
            var heroAttack = Math.random() * (11 - 1) + 1;
            if (heroAttack >= 3) {
                baseNHealth -= 20;
            }
            if(!(!gameOver() && hero.health > 0 && baseNHealth > 0)){
                clearInterval(nid);
            }
        } nid = setInterval(baseNAttack, 250);

        if (hero.health <= 0){
            var index = heroes.indexOf(hero);
            if (index > -1){
                heroes.splice(index, 1);
            }
        }


    }
    else{
        hero.fighting = true;
        var sid;
        function baseSAttack () { 
            var enemyAttack = Math.random() * (15 - 1) + 1;
            if (enemyAttack >= 6) {
                baseSHealth -= 20; // too easy or hard?
            }
            if(!(!gameOver() && enemy.health > 0 && baseSHealth > 0)){
                clearInterval(sid);
            }
        } sid = setInterval(baseSAttack, 250);
    }
}

function move(hero, enemy, attacker, enemyTarget){ //********************************************************
    
    var enemyEnt = false;
    var heroAttack = false;
    console.log("***********************************************");
    if(enemy === null){
        //console.log("hero move 1");
        var curEntity = get_current_hero();
        generateDijkstraGrid(hero);
        heroAttack = false;
    }
    else if (attacker == "h" || attacker == "b") {
        //console.log("hero move 2");
        var curEntity = get_current_hero();
        generateDijkstraGrid(hero);
        heroAttack = true;
    }

    else{
        //console.log("enemy move");
        var curEntity = enemy;
        curEntity.dest.x = hero.x; //~~(x / 32); //pathEnd.x   // move to checkRange?
        curEntity.dest.y = hero.y; //pathEnd.y   // correct math?
        console.log(curEntity.dest.x);
        console.log(curEntity.dest.y);
        enemyEnt = true;
        generateDijkstraGrid(enemy);
    }
    //console.log("grid made");

    curEntity.pathStart.x = ~~(curEntity.x / 32);
    curEntity.pathStart.y = ~~(curEntity.y / 32);
    console.log(curEntity.pathStart.x);
    console.log(curEntity.pathStart.y);

    var currentWeight = curEntity.dijkstraGrid[curEntity.pathStart.x][curEntity.pathStart.y];
    if (currentWeight === null || currentWeight === Number.MAX_VALUE) {
        return;
    }
    //console.log("entity grid");
    console.log(curEntity.dijkstraGrid);
    curEntity.path.push(curEntity.pathStart);

    var at = curEntity.pathStart;
    var tid;
    function movement() {
    //while (at.x != pathEnd.x || at.y != pathEnd.y) {
        //console.log("in movement");

        currentWeight = curEntity.dijkstraGrid[at.x][at.y];

        var neighbors = neighborsOf(at);
        var next = null;
        var nextWeight = currentWeight;

        //Take the first neighbor that has lower weight than our current position
        for (var i = 0; i < neighbors.length; i++) {

            var neighbor = neighbors[i];
            var neighborWeight = curEntity.dijkstraGrid[neighbor.x][neighbor.y];
            if (neighborWeight < nextWeight) {
                next = neighbor;
                nextWeight = neighborWeight;

            }
        }
        console.log("building path");

    // make sure the hero is oriented the right way
      if (next.x < at.x && next.y === at.y){
        curEntity.directionPointing = 'W';
        curEntity.x = (next.x * 32);
        curEntity.y = (next.y * 32);
        console.log("going West");
      }
      else if (next.x > at.x && next.y === at.y){
        curEntity.directionPointing = 'E';
        curEntity.x = (next.x * 32);
        curEntity.y = (next.y * 32);
        console.log("going East");
      }
      else if (next.x === at.x && next.y > at.y){
        curEntity.directionPointing = 'S';
        curEntity.x = (next.x * 32);
        curEntity.y = (next.y * 32);
        console.log("going South");
      }
      else if(next.x === at.x && next.y < at.y){
        curEntity.directionPointing = 'N';
        curEntity.x = (next.x * 32);
        curEntity.y = (next.y * 32);
        console.log("going North");
      }
   


      //curHero.x = (next.x * 32);
      //curHero.y = (next.y * 32);
      console.log(curEntity.x);
      console.log(curEntity.y);
      curEntity.path.push(next);
      at = next;

    // need to add case where enemie is encountered 
    // hero vs. base
    if (!(at.x != curEntity.dest.x || at.y != curEntity.dest.y)) {
        console.log("into while if statement");
        if (!enemyEnt && heroAttack && attacker === "b") {
            console.log("checkrange on hero 1");
            checkRange(curEntity, null, enemy, null);
            
        }
        //hero vs. enemy
        else if (!enemyEnt && heroAttack && attacker === "h"){
            console.log("checkrange on hero 2");
            checkRange(curEntity, enemy, null, null);
            
        }
        // non-tracking enemy checks all entities again? change to track?
        else if (enemyEnt && enemyTarget === null) {
            console.log("checkrange on enemy");
            checkRange(null, curEntity, null, null);
            
        }
        else if(enemyEnt && enemyTarget){
            checkRange(null, curEntity, null, enemyTarget);
        }
        clearInterval(tid);
    } 

      /*
      if (!(at.x != pathEnd.x || at.y != pathEnd.y)) {
        if (attackMode === true && enemy === null){
          attack(targetEnemy, true);
        }
        else if(attackMode === true){
          attack(targetHero, false);
        }
      } */
        //clearInterval(tid); //?  they leave this function so don't need?
      //} //?
    } //movement function
  //} //while
tid = setInterval(movement, 250);
} // move function



function set_current_hero(position){ // (heroes, position)
  //current_hero = entities[position]; //changed heroes to entities
  heroes[position].current = true;
}


function get_current_hero(){  // (heroes)
  for (var i = 0; i < heroes.length; i++){ //changed heroes -> entities
    if (heroes[i].current === true){ // changed heroes to entities
      return heroes[i]; // changed heroes to entities
    }
  }
  return "None";
}


function generateDijkstraGrid(entity) {
  //Generate an empty grid, set all places as weight null, which will stand for unvisited
  entity.dijkstraGrid = new Array(levelWidth);
  for (var x = 0; x < levelWidth; x++) {
    var arr = new Array(levelHeight);
    for (var y = 0; y < levelHeight; y++) {
      arr[y] = null;
    }
    entity.dijkstraGrid[x] = arr;
  }

  //Set all places where blockages are as being weight MAXINT (need a library for this?), which will stand for not able to go here
  for (var i = 0; i < blockingTerrain.length; i++) {
    for (var j = 0; j < blockingTerrain[i].length; j++){
      if(blockingTerrain[i][j] === true && blockingTerrain[i][j] !== 'wall'){ // comparing to bases
        var t = new Path(i, j); // blockingTerrain[i];
        entity.dijkstraGrid[t.x][t.y] = Number.MAX_VALUE;
      }
    }
  }

  //flood fill out from the end point
  entity.pathDist = 0;
  entity.dest.x = ~~(entity.dest.x / 32);
  entity.dest.y = ~~(entity.dest.y / 32);
  entity.dijkstraGrid[entity.dest.x][entity.dest.y] = 0;
  var toVisit = [entity.dest];

  //for each node we need to visit, starting with the pathEnd
  for (i = 0; i < toVisit.length; i++) {
    var neighbors = neighborsOf(toVisit[i]);

    //for each neighbor of this node (only straight line neighbors, not diagonals)
    for (var j = 0; j < neighbors.length; j++) {
      var n = neighbors[j];

      //We will only ever visit every node once as we are always visiting nodes in the most efficient order
      if (entity.dijkstraGrid[n.x][n.y] === null) {  // [n.x][n.y]
        n.distance = toVisit[i].distance + 1;
        entity.dijkstraGrid[n.x][n.y] = n.distance; // [n.x][n.y]
        toVisit.push(n);
      }
    }
  } 
}

function Path(newX, newY){
  this.x = newX;
  this.y = newY;
  this.distance = 0;

}

function neighborsOf(v){
  var res = [];

  if (v.x > 0) {
    res.push(new Path(v.x - 1, v.y));
  }
  if (v.y > 0) {
    res.push(new Path(v.x, v.y - 1));
  }

  if (v.x < levelWidth - 1) {
    res.push(new Path(v.x + 1, v.y));
  }
  if (v.y < levelHeight - 1) {
    res.push(new Path(v.x, v.y + 1));
  }

  return res;
}

function gameOver() {
    if (baseNHealth <= 0){
        console.log("You Win!");
    }
    else if (baseSHealth <= 0){
        console.log("You Lose!");
    }
    else{
        return false;
    }

}