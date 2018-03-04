function add_or_increment(dict, key) {
	dict[key] = dict.hasOwnProperty(key) ? dict[key] + 1 : 1;
}

class BibStatistic {

	constructor(bib_json) {

		this.author_cnt = {};
		this.type_cnt = {};
		this.year_cnt = {};

		for (var i = bib_json.length - 1; i >= 0; i--) {
			var item = bib_json[i]
			this.add_authors(item);
			this.add_type(item);
			this.add_year(item);
		}
	}

	add_authors(item_json) {
		if(!item_json.hasOwnProperty('author')) {
			add_or_increment(this.author_cnt, 'Unknown');
			return;
		}
		var authors = item_json['author'];
		for (var i = authors.length - 1; i >= 0; i--) {
			var author = authors[i]
			var author_str = (author.hasOwnProperty('family') ? author['family'] + ' ' : '') +
							 (author.hasOwnProperty('given') ? author['given'] : '');
			add_or_increment(this.author_cnt, author_str);
		}
	}

	add_type(item_json) {
		if(!item_json.hasOwnProperty('type')) {
			add_or_increment(this.type_cnt, 'Unknown');
			return;
		}
		add_or_increment(this.type_cnt, item_json['type']);
	}

	add_year(item_json) {
		if(!item_json.hasOwnProperty('issued') || !item_json['issued'].hasOwnProperty('date-parts')) {
			add_or_increment(this.year_cnt, 'Unknown');
			return;
		}
		add_or_increment(this.year_cnt, item_json['issued']['date-parts'][0][0]);
	}
}
