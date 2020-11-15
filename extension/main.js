/*
    EasyEDA Extension!
    
	extension-svgimport-test
	extension-svgimport-test

*/

var svgImportScale = 1;
var svgImportAs = 'svg';
var svgImportOffsetX = 0;
var svgImportOffsetY = 0;
var svgDocument = '';
var svgPaths = [];
var svgImportLayer = 1;
var unknownCommandFlag = false;

var dlg = api('createDialog', {
	title: "SVG Import",
    content : `
<style>
    #extension-svgimport-dlg fieldset {
        border: 0;
        margin-top: 4px;
    }
    #extension-svgimport-dlg legend {
        border-bottom: 1px solid #eee;
        width: 100%;
        font-weight: bold;
        padding: 0px;
    }
</style>
<div id="extension-svgimport-dlg">
    <fieldset>
        <legend class="i18n">Import file</legend>
        <input type="text" id="extension-svgimport-filename" readonly="readonly" size="26" title="Filename" />
        <a cmd="extension-svgimport-openfiledlg" class="easyui-linkbutton l-btn"><span class="l-btn-left"><span class="l-btn-text i18n" i18n="Load file...">Load file</span></span></a>
        <input type="file" id="extension-svgimport-fileinput" accept=".svg,.xml" style="display:none">
    </fieldset>
    <fieldset>
        <legend class="i18n">Import as</legend>
        <div><input type="radio" name="import-as" id="import-as-svg" value="svg" checked="checked"><label for="import-as-svg" class="i18n">SVG Node (copper, soldermask, silk, document)</label></div>
        <div><input type="radio" name="import-as" id="import-as-solid" value="solid"><label for="import-as-solid" class="i18n">Solid region (copper fill / keepout, board cutout)</label></div>
        <div><input type="radio" name="import-as" id="import-as-track" value="track"><label for="import-as-track" class="i18n">Track (board outline, silk)</label> <i class="i18n" style="color:#A00">(only line segments supported)</i></div>
    </fieldset>
    <fieldset>
        <legend class="i18n">Import scale (EasyEDA base unit is 0.1 inch)</legend>
        <div>
            <input type="number" step="any" name="import-scale" id="import-scale" value="1" size="4" style="width:8em">
            <a class="l-btn" cmd="extension-svgimport-set_mil"><span class="l-btn-left"><span class="l-btn-text">mil</span></span></a>
            <a class="l-btn" cmd="extension-svgimport-set_inch"><span class="l-btn-left"><span class="l-btn-text">inch</span></span></a>
            <a class="l-btn" cmd="extension-svgimport-set_mm"><span class="l-btn-left"><span class="l-btn-text">mm</span></span></a>
        </div>
    </fieldset>
    <fieldset>
        <legend class="i18n">Import origin (svg origin will be placed here)</legend>
        <div>
            <input type="number" step="any" name="import-origin-x" id="import-origin-x" value="0" size="5" style="width:5em">
            <input type="number" step="any" name="import-origin-y" id="import-origin-y" value="0" size="5" style="width:5em">
            <a class="l-btn" id="btn-get-offsets" cmd="extension-svgimport-origin"><span class="l-btn-left"><span class="l-btn-text i18n">Editor Origin</span></span></a>
        </div>
    </fieldset>
    <!--
    <fieldset>
        <legend class="i18n">Options</legend>
        <div>
            <input type="checkbox" id="extension-svgimport-flip-x" /> <label for="extension-svgimport-flip-x" class="i18n">flip in x direction</label>
        </div>
        <div>
            <input type="checkbox" id="extension-svgimport-merge-paths" /> <label for="extension-svgimport-merge-paths" class="i18n">merge all paths into one</label>
        </div>
    </fieldset>
    -->
    <fieldset>
        <legend class="i18n">Layer</legend>
        <div>
            <select name="import-layer" id="import-layer">
                <option value="0">none</option>
            </select>
        </div>
    </fieldset>
</div>`,
	width : 380,
	height : 400,
	modal : false,
	collapsible: true,
	resizable: true,
	buttons : [{
			text : 'Import',
			iconCls : 'icon-ok',
			cmd : 'extension-svgimport-import'
		}, {
			text : 'Close',
			cmd : 'dialog-close'
		}
	]
});


var aboutdlg = api('createDialog', {
	title: "SVG Import - About",
    content : `
    <div style="padding: 8px; text-align: center">
        <h1>SVG Import</h1>
        <p>Icons by <a target="_blank" href="https://www.flaticon.com/de/autoren/smashicons" title="Smashicons">Smashicons</a> from <a target="_blank" href="https://www.flaticon.com/de/" title="Flaticon">www.flaticon.com</a></p>
        <p>Visit <a href="https://github.com/xsrf/easyeda-svg-import" target="_blank">https://github.com/xsrf/easyeda-svg-import</a> for updates</p>
    </div>

`,
	width : 320,
	height : 240,
	modal : true,
	collapsible: false,
	resizable: false,
	buttons : [{
			text : 'Close',
			cmd : 'dialog-close'
		}
	]
});


api('createCommand', {
	'extension-svgimport-import' : () => {
        doImport();
	},
	'extension-svgimport-open' : () => {
        getOffsets();
        uiUpdateLayerOptions();
        dlg.dialog('open');
        dlg.dialog('expand');
    },
	'extension-svgimport-openfile' : () => {
        getOffsets();
        uiUpdateLayerOptions();
        dlg.dialog('open');
        dlg.dialog('expand');
        $('#extension-svgimport-fileinput').click();
    },
    'extension-svgimport-origin' : () => {
        getOffsets();
    },
    'extension-svgimport-set_mm' : () => {
        setSvgImportScale(10/2.54);
        uiDisplayImportScale();
    },
    'extension-svgimport-set_inch' : () => {
        setSvgImportScale(10);
        uiDisplayImportScale();
    },
    'extension-svgimport-set_mil' : () => {
        setSvgImportScale(0.01);
        uiDisplayImportScale();
    },
    'extension-svgimport-openfiledlg' : () => {
        $('#extension-svgimport-fileinput').click();
    },
    'extension-svgimport-github' : () => {
        window.open('https://github.com/xsrf/easyeda-svg-import','_blank');
    },
    'extension-svgimport-about' : () => {
        aboutdlg.dialog('open');
    }
});

api('createToolbarButton', {
	icon: api('getRes', {file:'icon.svg'}),
	title:'SVG Import',
	fordoctype:'pcb',
	menu:[
		{
			text:"Show Dialog", 
			cmd:"extension-svgimport-open", 
			title:'Show Dialog',
			icon: api('getRes', {file:'icon.svg'})
        },
        {
			text:"Import file ...", 
			cmd:"extension-svgimport-openfile", 
			title:'Import file ...'
		},
        {
			text:"Visit GitHub page", 
			cmd:"extension-svgimport-github", 
            title:'Visit GitHub page'
		},
        {
			text:"About", 
			cmd:"extension-svgimport-about", 
            title:'About'
		}
	]
});

function uiDisplayImportScale() {
    $('#import-scale').val(svgImportScale);
}

function setSvgImportScale(s) {
    svgImportScale = s;
    debugLog('svgImportScale : '+svgImportScale);
}

$('#import-scale').on('change',(e)=>{
    if(e.target.value) {
        setSvgImportScale(e.target.value);
    }
});

$('#import-origin-x').on('change',(e)=>{
    if(e.target.value) {
        setSvgImportOrigin(e.target.value, NaN);
    }
});

$('#import-origin-y').on('change',(e)=>{
    if(e.target.value) {
        setSvgImportOrigin(NaN, e.target.value);
    }
});

$('#import-as-svg').on('change',(e)=>{
    if(e.target.value) {
        setSvgImportAs(e.target.value);
    }
});

$('#import-as-solid').on('change',(e)=>{
    if(e.target.value) {
        setSvgImportAs(e.target.value);
    }
});

$('#import-as-track').on('change',(e)=>{
    if(e.target.value) {
        setSvgImportAs(e.target.value);
    }
});

$('#extension-svgimport-fileinput').on('change',(e)=>{
    var file = document.querySelector('#extension-svgimport-fileinput').files[0];    
    if (file.name.match(/\.(svg)$/)) {
        var reader = new FileReader();    
        reader.onload = function() {
            svgDocument = reader.result;
            debugLog(`Loaded ${file.name} with ${svgDocument.length} bytes`);
            $('#extension-svgimport-filename').val(file.name);
        };    
        reader.readAsText(file);
    } else {
        $.messager.error("err_file_not_supported");
    }
    $('#extension-svgimport-fileinput').val(''); // reset value, so reopening the same file will trigger it again
});

$('#import-layer').on('change',(e)=>{
    if(e.target.value) {
        setSvgImportLayer(e.target.value);
    }
});

function setSvgImportLayer(v) {
    svgImportLayer = v;
    debugLog(`svgImportLayer : ${svgImportLayer}`);
}

function uiDisplayImportLayer() {
    $('#import-layer').val(svgImportLayer);
}

function setSvgImportAs(v) {
    svgImportAs = v;
    uiDisplayImportAs();
    debugLog(`svgImportAs : ${svgImportAs}`);
}

function uiDisplayImportAs() {
    $('#import-as-' + svgImportAs).prop("checked", true);
}

function setSvgImportOrigin(x,y) {
    if(!isNaN(x)) svgImportOffsetX = x;
    if(!isNaN(y)) svgImportOffsetY = y;
    uiDisplayImportOrigin();
    debugLog(`svgImportOffset : ( ${svgImportOffsetX} , ${svgImportOffsetY} )`);
}

function uiDisplayImportOrigin() {
    $('#import-origin-x').val(svgImportOffsetX);
    $('#import-origin-y').val(svgImportOffsetY);
}

function getOffsets() {
    let s = api('getSource', {type: "json"});
    setSvgImportOrigin(s.canvas.originX,s.canvas.originY);
}

function uiUpdateLayerOptions() {
    let el = document.querySelector('#import-layer');
    let s = api('getSource', {type: "json"});
    while(e=el.firstChild) el.removeChild(e); // remove all options
    let layers = Object.keys(s.layers).map( k => { let l = s.layers[k]; l.key=k; return l; } ).filter( l => l.visible);
    layers.forEach( layer => {
        el.insertAdjacentHTML("beforeend",`<option value="${layer.key}">${layer.key} - ${layer.name}</option>`);
    });
    uiDisplayImportLayer();
}

function uiDisplayImportLayer() {
    $('#import-layer').val(svgImportLayer);
}

function debugLog(msg) {
    console.log(`%c[svgimport] %c${msg}`,'font-weight: bold; color: #00D;','');
}


function doImport() {
    unknownCommandFlag = false;
    const regexp = /<path[^>]*[^a-z]d="([^"]+)"/g;
    var paths = [...svgDocument.matchAll(regexp)].map(e => e[1]);
    debugLog(`Found ${paths.length} <paths> in SVG`);
    if(paths.length == 0) {
        $.messager.error('err_no_paths_found');
        return;
    }

    paths = paths.map(p => reparseSVGPath(p)).filter(p => p.length > 0);

    debugLog(`${paths.length} paths left after reparsing`);
    if(paths.length == 0) {
        $.messager.error('err_parsing_all_paths');
        return;
    }
    if(unknownCommandFlag) {
        $.messager.warn('warn_parsing_some_paths');
    }
    svgPaths = paths;

    if(svgImportAs == 'solid') {
        // solid regions only support split paths
        svgPaths = splitPaths(svgPaths);        
        addSolidRegion(svgPaths);
    }

    if(svgImportAs == 'svg') {
        addSVGNode(svgPaths);
    }

    if(svgImportAs == 'track') {
        svgPaths = splitPaths(svgPaths);
        var cntBeforePts = svgPaths.length;
        svgPaths = pathsToPoints(svgPaths);
        if(svgPaths.length == 0) {
            $.messager.error('err_no_track_points');
            return;
        }
        if(svgPaths.length < cntBeforePts) {
            $.messager.warn('warn_some_track_points');
        }
        addTrack(svgPaths);
    }
    

}

function splitPaths(paths) {
    return paths.join(' ').split('M').filter(e => e.length).map(e => 'M ' + e.trim());
}

function joinPaths(paths) {
    return paths.join(' ');
}

function pathsToPoints(paths) {
    paths = splitPaths(paths).filter(p => !p.match(/[CSQTA]/));
    paths = paths.map(p => {
        p = p.replaceAll(/[MZL]/g,'').replaceAll(/[ ]+/g,' ').trim().split(' ');
        pts = Array();
        for(var i=0; i<Math.floor(p.length/2); i++) {
            pts[i] = {x: p[i*2], y: p[i*2+1]}
        }
        return pts;
    })
    return paths;
}

function newId() {
    return "cgge"+Math.floor(Math.random() * 9e6);
}

function addSolidRegion(code) {
    if(typeof(code) == 'string') code = [code];
    let s = api('getSource', {type: "json"});
    if(s.SOLIDREGION === undefined) s.SOLIDREGION = {};
    code.forEach(e => {
        let iid = newId();   
        s.SOLIDREGION[iid] = { gId: iid, layerid: `${svgImportLayer}`, pathStr: e, type: "solid"};
    });
    api('applySource', {source: s, createNew: false});
}
   

function addSVGNode(code) {
    if(typeof(code) == 'string') code = [code];
    let s = api('getSource', {type: "json"});
    if(s.SVGNODE === undefined) s.SVGNODE = {};
    code.forEach(e => {
        let iid = newId();
        s.SVGNODE[iid] = { 
            gId: iid, 
            layerid: `${svgImportLayer}`, 
            nodeName: "path",
            nodeType: 1,
            attrs: {
                d: e,
                id: iid, 
                layerid: `${svgImportLayer}`,
                stroke: "none"
            }
        };
    });
    api('applySource', {source: s, createNew: false});
}

function addTrack(points) {
    if(typeof(points) == 'string') points = [points];
    let s = api('getSource', {type: "json"});
    if(s.TRACK === undefined) s.TRACK = {};
    points.forEach(e => {
        let iid = newId();
        s.TRACK[iid] = { 
            gId: iid, 
            layerid: `${svgImportLayer}`, 
            strokeWidth: 1,
            pointArr: e
        };
    });
    api('applySource', {source: s, createNew: false});
}


function reparseSVGPath(pathData) {
    // Add spaces around chars ( M5,5L8,8 -> M 5,5 L 8,8 ) except e which is used as 42e-3
    const regex_chars = /([a-df-zA-DF-Z])/g;
    pathData = pathData.replaceAll(regex_chars,' $1 ');
    // Add spaces before minus ( M5-5 -> M5 -5 )
    const regex_minus = /([^eE])(-)/g;
    pathData = pathData.replaceAll(regex_minus,'$1 $2');
    // Normalize spaces / remove comma ( M5-5L8,8 -> M 5 -5 L 8 8 )
    const regex_svg = /[^0-9a-zA-Z-\.]+/g;
    pathData = pathData.replaceAll(regex_svg,' ').trim();

    var c = pathData.split(' ');
    var idx = 0;
    var cx = 0;
    var cx = 0;
    var zx = 0;
    var zy = 0;
    var k1x = k1y = k2x = k2y = rx = ry = rt = f1 = f2 = 0;
    var sx = svgImportScale;
    var sy = svgImportScale;
    var ox = svgImportOffsetX;
    var oy = svgImportOffsetY;
    var o = Array();
    var lastCmd = 'M';

    debugLog(`Importing scale ${svgImportScale}, Offset (${svgImportOffsetX},${svgImportOffsetY})`);

    // Parsing the SVG. Converting all relative commands to absolute and stripping commands not supported!
    while(idx < c.length) {
        // Parse the current command
        if(isNaN(Number(c[idx]))) {
            // save the current/last command for repetitions
            lastCmd = c[idx];
        } else {
            // additional coordinates are parsed using the last known command
            idx--;
        }
        switch(lastCmd) {
            case 'M':
                cx = zx = Number(c[++idx]);
                cy = zy = Number(c[++idx]);
                o = [...o, 'M', cx*sx+ox, cy*sy+oy];
                break;
            case 'm':
                cx = zx += Number(c[++idx]);
                cy = zy += Number(c[++idx]);
                o = [...o, 'M', cx*sx+ox, cy*sy+oy];
                break;
            case 'Z':
            case 'z':
                o = [...o, 'L', zx*sx+ox, zy*sy+oy];
                break;
            case 'L':
                cx = Number(c[++idx]);
                cy = Number(c[++idx]);
                o = [...o, 'L', cx*sx+ox, cy*sy+oy];            
                break;
            case 'l':
                cx += Number(c[++idx]);
                cy += Number(c[++idx]);
                o = [...o, 'L', cx*sx+ox, cy*sy+oy];
                break;
            case 'H':
                cx = Number(c[++idx]);
                o = [...o, 'L', cx*sx+ox, cy*sy+oy];
                break;
            case 'h':
                cx += Number(c[++idx]);
                o = [...o, 'L', cx*sx+ox, cy*sy+oy];            
                break;
            case 'V':
                cy = Number(c[++idx]);
                o = [...o, 'L', cx*sx+ox, cy*sy+oy];            
                break;
            case 'v':
                cy += Number(c[++idx]);
                o = [...o, 'L', cx*sx+ox, cy*sy+oy];            
                break;
            case 'Q':
                k1x = Number(c[++idx]);
                k1y = Number(c[++idx]);
                cx = Number(c[++idx]);
                cy = Number(c[++idx]);
                o = [...o, 'Q', k1x*sx+ox, k1y*sy+oy, cx*sx+ox, cy*sy+oy];
                break;
            case 'q':
                k1x = cx + Number(c[++idx]);
                k1y = cy + Number(c[++idx]);
                cx += Number(c[++idx]);
                cy += Number(c[++idx]);
                o = [...o, 'Q', k1x*sx+ox, k1y*sy+oy, cx*sx+ox, cy*sy+oy];
                break;
            case 'T':
                k1x = cx + (cx-k1x);
                k1y = cy + (cy-k1y);
                cx = Number(c[++idx]);
                cy = Number(c[++idx]);
                o = [...o, 'Q', k1x*sx+ox, k1y*sy+oy, cx*sx+ox, cy*sy+oy];
                break;
            case 't':
                k1x = cx + (cx-k1x);
                k1y = cy + (cy-k1y);
                cx += Number(c[++idx]);
                cy += Number(c[++idx]);
                o = [...o, 'Q', k1x*sx+ox, k1y*sy+oy, cx*sx+ox, cy*sy+oy];
                break;
            case 'C':
                k1x = Number(c[++idx]);
                k1y = Number(c[++idx]);
                k2x = Number(c[++idx]);
                k2y = Number(c[++idx]);
                cx = Number(c[++idx]);
                cy = Number(c[++idx]);
                o = [...o, 'C', k1x*sx+ox, k1y*sy+oy, k2x*sx+ox, k2y*sy+oy, cx*sx+ox, cy*sy+oy];
                break;
            case 'c':
                k1x = cx + Number(c[++idx]);
                k1y = cy + Number(c[++idx]);
                k2x = cx + Number(c[++idx]);
                k2y = cy + Number(c[++idx]);
                cx += Number(c[++idx]);
                cy += Number(c[++idx]);
                o = [...o, 'C', k1x*sx+ox, k1y*sy+oy, k2x*sx+ox, k2y*sy+oy, cx*sx+ox, cy*sy+oy];
                break;
            case 'S':
                k1x = cx + (cx-k2x);
                k1y = cy + (cy-k2y);  
                k2x = Number(c[++idx]);
                k2y = Number(c[++idx]);
                cx = Number(c[++idx]);
                cy = Number(c[++idx]);
                o = [...o, 'C', k1x*sx+ox, k1y*sy+oy, k2x*sx+ox, k2y*sy+oy, cx*sx+ox, cy*sy+oy];
                break;
            case 's':
                k1x = cx + (cx-k2x);
                k1y = cy + (cy-k2y);
                k2x = cx + Number(c[++idx]);
                k2y = cy + Number(c[++idx]);
                cx += Number(c[++idx]);
                cy += Number(c[++idx]);
                o = [...o, 'C', k1x*sx+ox, k1y*sy+oy, k2x*sx+ox, k2y*sy+oy, cx*sx+ox, cy*sy+oy];
                break;
            case 'A':
                rx = Number(c[++idx]);
                ry = Number(c[++idx]);
                rt = Number(c[++idx]);
                f1 = Number(c[++idx]);
                f2 = Number(c[++idx]);
                cx = Number(c[++idx]);
                cy = Number(c[++idx]);
                o = [...o, 'A', rx*sx, ry*sy, rt, f1, f2, cx*sx+ox, cy*sy+oy];
                break;
            case 'a':
                rx = Number(c[++idx]);
                ry = Number(c[++idx]);
                rt = Number(c[++idx]);
                f1 = Number(c[++idx]);
                f2 = Number(c[++idx]);
                cx += Number(c[++idx]);
                cy += Number(c[++idx]);
                o = [...o, 'A', rx*sx, ry*sy, rt, f1, f2, cx*sx+ox, cy*sy+oy];
                break;
            default:
                // Flag unknown command
                debugLog(`Unexpected SVG Command "${lastCmd}" at idx ${idx} sequence "... ${c[idx-1]} > ${c[idx]} < ${c[idx+1]} ..."`);
                unknownCommandFlag = true;
                return '';
        }
        idx++;
    }
    return o.join(' ');
}