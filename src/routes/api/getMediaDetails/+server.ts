import {
	OMDB_API_KEY
} from '$env/static/private';
import {
	json
} from '@sveltejs/kit';
 

import * as cheerio from 'cheerio';


export async function GET({
	request
}: {
	request: any
}) {
	let tm1=new Date().getTime();
	// const {
	// 	title
	// } = await request.json();
	const rurl = new URL(request.url);
	const title = rurl.searchParams.get("title");
	// const url = `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${title}`;

	// const res = await fetch(url);
	// const details = await res.json();
	// return json(details);
	//   let title="A计划"
	let info = {
		"Title": "",
		"Year": "未设置",
		"Rated": "未获取",
		"Released": "未设置",
		"Runtime": "未设置",
		"Genre": "未设置",
		"Director": "无",
		"Writer": "无",
		"Actors": "无",
		"Plot": "无",
		"Language": "无",
		"Country": "无",
		"Awards": "无",
		"Poster": "",
		"Ratings": [{
			"Source": "无",
			"Value": ""
		}],
		"Metascore": "无",
		"imdbRating": "无",
		"imdbVotes": "无",
		"imdbID": "无",
		"Type": "无",
		"DVD": "无",
		"BoxOffice": "无",
		"Production": "无",
		"Website": "无",
		"Response": "True",
		"PlayURL":"#"
	};

	let headers = new Headers({
		"User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
		'Referer': 'm.douban.com',
		"Accept-Encoding":"gzip, deflate, br",
	});

	let pc_headers = new Headers({
		"User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
		'Referer': 'm.douban.com',
		"Accept-Encoding":"gzip, deflate, br",
	});

	let url = `https://m.douban.com/search/?query=${title}&type=1002`;
	const res = await fetch(url, {
			method: 'GET',
			headers: headers
		}
		);
	const lists = await res.text();

	// const cheerio = require("cheerio");
 
	let $ = cheerio.load(lists);
	let tm2=new Date().getTime();
	console.log("查询耗时" + (tm2-tm1))
	const modules_rs = $(".search-results").children();
	for (const item of modules_rs) {
		const category = $(item).find(".search-results-modules-name").text();
		if (category == "电影" || category == "电视剧") {
			let rs = $($(item).find(".search_results_subjects")[0]).children();
			var titleArray=[];
			for(const itemFilm of $($(item).find(".search_results_subjects")[0]).find('.subject-title')){
				$(itemFilm).text()
				titleArray.push($(itemFilm).text())
				console.log($(itemFilm).text())
			}
			 const matched = getMaxSimilarText(title,titleArray)
			let image = $(rs[matched[0]]).find('img')[0].attribs["src"]

			image= "/api/images?url="+image.slice(8)
			console.log(image)
			info.Poster = image;
			let detail_url = $(rs[matched[0]]).find('a')[0].attribs["href"];

			let id = detail_url.slice(detail_url.lastIndexOf('subject/')+8,-1)
			detail_url = `https://www.douban.com${detail_url}`;

			//    var cheerio = require('cheerio');
			// detail_url = "https://m.douban.com/movie/subject/4811774/";
			console.log(detail_url)

			// const res_detail = await fetch(detail_url, {
			// 	method: 'GET',
			// 	headers: headers
			// });

			// let tm_fetch_detail=new Date().getTime();
			// console.log("tm_fetch_detail" + (tm_fetch_detail-tm2))
			 
			// console.log(id)
			// let actor_url = `https://m.douban.com/rexxar/api/v2/movie/${id}/credits`;
			// console.log(actor_url)

			// const res_actors = await fetch(actor_url, {
			// 	method: 'GET',
			// 	headers: headers
			// });

			// detail_url = "https://m.douban.com/movie/subject/4811774/";
			console.log(detail_url)
	
			const pc_res_detail = await fetch(detail_url, {
				method: 'GET',
				headers: pc_headers
			});
	
			// var cheerio = require('cheerio');
			
			// const details = await res_detail.text();

			// let $detail = cheerio.load(details);
			let tm3=new Date().getTime();
			console.log("查询详情耗时" + (tm3-tm2))
			// const intro = $detail(".subject-intro .bd p").text()
			// console.log(intro)
			// info.Plot = intro

			// info.Ratings[0].Value = $detail("head > meta[itemprop='ratingValue']").attr("content")
			// info.Rated="豆瓣："+$detail("head > meta[itemprop='ratingValue']").attr("content");
			// info.Title = $detail(".sub-title").text()

			
			// console.log(info.Title)

			// const actors_json = await res_actors.json();
			// actors_json.items

			// let directors = [];
			// let actors = []
			// let writers = []
			// for (const person of actors_json.items) {
			// 	if (person.category == "导演") {
			// 		directors.push(person.name);
			// 	}
			// 	if (person.category == "演员") {
			// 		actors.push(person.name);
			// 	}
			// 	if (person.category == "编剧") {
			// 		writers.push(person.name);
			// 	}


			// }


			const pc_details = await pc_res_detail.text();
			console.log(pc_details)
			let $pc = cheerio.load(pc_details);
			let tm4=new Date().getTime();
			console.log("查询演员信息耗时" + (tm4-tm3))
	 
			info.Title=$pc("span[property='v:itemreviewed']")[0].children[0].data
			info.Plot = $pc( $pc("span[property='v:summary']")[0]).html();
			if( $pc('a[data-cn="爱奇艺视频"]')){
				const url = $pc('a[data-cn="爱奇艺视频"]').attr('href');
				if(url){
					// 创建URL对象
					const parsedUrl = new URL(url);

					// 获取url参数的值
					const urlParam = parsedUrl.searchParams.get('url');

					// 解码url参数的值
					info.PlayURL = decodeURIComponent(urlParam);
			}
			
			}
			info.Year= $pc('span[class=year]')[0].children[0].data;
			if($pc("strong[property='v:average']")[0].children[0])
				info.Rated="豆瓣："+ $pc("strong[property='v:average']")[0].children[0].data
			let actorsMeta=$pc("head > meta[property='video:actor']");
			let directorsMeta=$pc("head > meta[property='video:director']");
			//let writersMeta=$pc("head > meta[property='video:director']");

			$pc("#content > div > div.aside > script:nth-child(2)")
			let directors = [];
			let actors = []
			let writers = [""]
			
			if(actorsMeta){
				for(var ai=0;  ai<actorsMeta.length && ai<5;ai++){
					actors.push(actorsMeta[ai].attribs["content"])
				}
			}
			if(directorsMeta){
				for(var   di=0;di<directorsMeta.length && di<5;di++){
					directors.push(directorsMeta[di].attribs["content"])
				}
			}
	

			info.Director = directors.join(",");
			info.Actors = actors.join(",");
			info.Writer = writers.join(",");

		}
	}
	return json(info);

}

function getSimilarityForArray(text:string,textArray:string[]){
	var simArray=[]
	for(var i=0;i<textArray.length;i++){
		const similarityValue =cosineSimilarity(text,textArray[i])
		simArray.push({"index":i, "value":similarityValue})
	}
	
	  return simArray;
}

function getMaxSimilarText(text:string,textArray:string[]){
	if(textArray.length==0)
		return [];
	var simArray= getSimilarityForArray(text,textArray)
	simArray.sort(function(a, b) {
		return b.value - a.value;
	  });
	  return [simArray[0].index,textArray[simArray[0].index]]
}

// 余弦相似度
function cosineSimilarity(text1:string, text2:string) {
	// 将文本转换为字符数组
	const chars1 = text1.split('');
	const chars2 = text2.split('');
  
	// 创建一个包含所有字符的集合
	const charSet = new Set([...chars1, ...chars2]);
  
	// 计算每个字符在两个文本中的出现次数
	const charCount1 = countOccurrences(chars1);
	const charCount2 = countOccurrences(chars2);
  
	// 计算余弦相似度
	const dotProduct = calculateDotProduct(charCount1, charCount2);
	const magnitude1 = calculateMagnitude(charCount1);
	const magnitude2 = calculateMagnitude(charCount2);
	const similarity = dotProduct / (magnitude1 * magnitude2);
  
	return similarity;
  }
  
  // Jaccard相似度
  function jaccardSimilarity(text1:string, text2:string) {
	// 将文本转换为字符数组
	const chars1 = text1.split('');
	const chars2 = text2.split('');
  
	// 创建两个字符数组的集合
	const set1 = new Set(chars1);
	const set2 = new Set(chars2);
  
	// 计算交集和并集的大小
	const intersectionSize = calculateIntersectionSize(set1, set2);
	const unionSize = calculateUnionSize(set1, set2);
  
	// 计算Jaccard相似度
	const similarity = intersectionSize / unionSize;
  
	return similarity;
  }
  
  function countOccurrences(chars:string) {
	const charCount = {};
	for (const char of chars) {
	  if (charCount[char]) {
		charCount[char]++;
	  } else {
		charCount[char] = 1;
	  }
	}
	return charCount;
  }
  
  function calculateDotProduct(charCount1, charCount2) {
	let dotProduct = 0;
	for (const char in charCount1) {
	  if (charCount2[char]) {
		dotProduct += charCount1[char] * charCount2[char];
	  }
	}
	return dotProduct;
  }
  
  function calculateMagnitude(charCount) {
	let magnitude = 0;
	for (const char in charCount) {
	  magnitude += Math.pow(charCount[char], 2);
	}
	return Math.sqrt(magnitude);
  }
  
  function calculateIntersectionSize(set1, set2) {
	let intersectionSize = 0;
	for (const char of set1) {
	  if (set2.has(char)) {
		intersectionSize++;
	  }
	}
	return intersectionSize;
  }
  
  function calculateUnionSize(set1, set2) {
	return set1.size + set2.size - calculateIntersectionSize(set1, set2);
  }
  
  // 示例用法
//   const text1 = "你好，世界！";
//   const text2 = "你好，大家！";
//   const cosineSimilarityValue = cosineSimilarity(text1, text2);
//   const jaccardSimilarityValue = jaccardSimilarity(text1, text2);
//   console.log(cosineSimilarityValue); // 输出：0.816496580927726
//   console.log(jaccardSimilarityValue); // 输出：0.6666666666666666
