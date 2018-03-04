var Cite = require('citation-js')

// jQuery elements for Cite
class CiteControls {
	constructor(bibx_in, type, style, lang, bibx_out, bibx_stat) {
		this.$bibx_in = bibx_in;
		this.$type = type;
		this.$styl = style;
		this.$lang = lang;
		this.$bibx_out = bibx_out;
		this.$bibx_stat = bibx_stat;
	}
};

var ctrls; // holder for controls
var cite; // instance of citation class

// Prepare url according to control's values
function format_url() {
	var url = new URL(window.location.href)
	var newUrl = url.origin + url.pathname
	newUrl += '?'
	var bib_url = new URL(ctrls.$bibx_in.val())
	newUrl += (bib_url.origin.search('raw.githubusercontent.com') != -1 ?
		'github_url=' + bib_url.pathname :
		'url=' + bib_url.href);
	newUrl += '&type=' + ctrls.$type.val();
	newUrl += '&styl=' + ctrls.$styl.val();
	newUrl += '&lang=' + ctrls.$lang.val();
	return newUrl;
};

// Parse URL arguments to set controls
function parse_url() {
	var url = new URL(window.location.href)
	if(arg = url.searchParams.get('github_url')) {
		ctrls.$bibx_in.val('https://raw.githubusercontent.com' + arg)
	}
	else if(arg = url.searchParams.get('url')) {
		ctrls.$bibx_in.val(arg)
	}
	if(arg = url.searchParams.get('type')) {
		ctrls.$type.val(arg)
	}
	if(arg = url.searchParams.get('style')) {
		ctrls.$type.val(arg)
	}
	if(arg = url.searchParams.get('lang')) {
		ctrls.$lang.val(arg)
	}
};

// Declare function to update the output
function update_output() {

	var opt = {
	  format: 'string'
	}

	// Make a factory for callback
	var callbackFactory = function (out, stat) {
	  return function (data) {
	  	cite.set(data);
	    out.html(cite.get(opt))

	    var stat = new BibStatistic(JSON.parse(cite.get({format:'json'})));
	  }
	}

	// Callbacks
	var bibxCb = callbackFactory(ctrls.$bibx_out, ctrls.$bibx_stat)

	// Get user options
	opt.type = ctrls.$type.val()
	opt.style = ctrls.$styl.val()
	opt.lang = ctrls.$lang.val()

	// update URL
	if (history.pushState) {
		window.history.pushState('<empty>', '<empty>', format_url());
	} else {
		document.location.href = format_url();
	}

	// Set data (explicit parsing only recommended for async) and set html element to get output
	// Make shorter ref to function
	Cite.parse.input.async.chain(ctrls.$bibx_in).then(bibxCb)
};

function init_bibtex_viewer(bibx_in, type, style, lang, bibx_out, bibx_stat) {

	ctrls = new CiteControls(bibx_in, type, style, lang, bibx_out, bibx_stat);

	// Register custom styles
	async function custom_registrar(git_repo, custom_dict, cite_reg_func){
		for (var key in custom_dict) {
			if(custom_dict.hasOwnProperty(key)) {
				await $.get(git_repo + custom_dict[key], function (response) {
					cite_reg_func(key, response);
					console.log('Register ' + key)
				});
			}
		}
	};

	cite_github = 'https://raw.githubusercontent.com/citation-style-language/'
	Promise.all([custom_registrar(cite_github + 'styles/master/',
						{'gost' : 'gost-r-7-0-5-2008.csl'},
						 Cite.CSL.register.addTemplate),
				 custom_registrar(cite_github + 'locales/master/',
						{'ru-RU' : 'locales-ru-RU.xml'},
						 Cite.CSL.register.addLocale)])
	.then(function() {

		parse_url()

		console.log('Create cite')
		// Set variables
		cite = new Cite()
		var opt = {
		  format: 'string'
		}

		update_output();
	})
};
