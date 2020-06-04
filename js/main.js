var usersList = null;//имена пользователей
var albumsList = null;//альбомы пользователей
var photosList = null;//фотографии к альбомам пользователей


var albomsIsLoaded = new Array();//массив загруженных альбомов
var albumsIsSavingFavorite = new Array();//массив альбомов в "избранном"
var FavoritesStorage = new Array();//массив-хранилище "избранных"

//Элементы
var element_content  = document.querySelector(".box__content");
var element_triang  = document.querySelector(".box__triangle");
var element_favorites  = document.querySelector(".box__favorites");

//Кнопки
var btn_catalog = document.querySelector(".button__catalog");
var btn_favorite = document.querySelector(".button__favorite");
var btn_modal = document.querySelector(".box__modal");

//Добавление обработчиков
btn_catalog.addEventListener("click", btnCatalog); 
btn_favorite.addEventListener("click", btnFavorites); 
btn_modal.addEventListener("click", btnModal);

//функции работы с  local storage
//Чтение
function readFromLocalStorage()
{
	FavoritesStorage = JSON.parse(localStorage.getItem('favorites')) || [];
	for(let i = 0; i < FavoritesStorage.length; ++i)
	{
		btnAddToFavorites(FavoritesStorage[i].id, FavoritesStorage[i].src, FavoritesStorage[i].alt, FavoritesStorage[i].title, false);
	}
}
//Добавление
function addToLocalStorage(id, src, alt, title)
{   
    FavoritesStorage.push({id: id, src: src, alt: alt, title: title});
    localStorage.clear();
    localStorage.setItem('favorites', JSON.stringify(FavoritesStorage));
}
//Удаление
function removeFromLocalStorage(id)
{
	
	for(let i = 0; i < FavoritesStorage.length; i++)
	{
		if(id == FavoritesStorage[i].id)
		{
			FavoritesStorage.splice(i, 1);
		}
	}

	localStorage.clear();

	localStorage.setItem('favorites', JSON.stringify(FavoritesStorage));
}
//================================

//Функции обработчики кнопок
//Каталог
function btnCatalog()
{
	element_triang.style.left = "25%";

	element_content.style.display = "block";
    element_favorites.style.display = "none";

    if(element_favorites.classList.contains("box__content_show")){
    	element_triang.classList.toggle("box__triangle_show");
    	element_favorites.classList.toggle("box__content_show");
    }

	element_content.classList.toggle("box__content_show");
	element_triang.classList.toggle("box__triangle_show");
}
//Избранное
function btnFavorites()
{
	element_triang.style.left = "68%";
   
    element_content.style.display = "none";
    element_favorites.style.display = "block";
    
    if(element_content.classList.contains("box__content_show")){
    	element_triang.classList.toggle("box__triangle_show");
    	element_content.classList.toggle("box__content_show");
    }
	
	element_favorites.classList.toggle("box__content_show");
	element_triang.classList.toggle("box__triangle_show");
}
//Показать полноразмерное фото
function btnShowFullSizePhoto(alt)
{
	document.querySelector(".box__modal > img").src = alt;
	document.querySelector(".box__modal").style.display = "block";
} 
//Добавить в "избранное"
function btnAddToFavorites(id, src, alt, title, flag = true)
{

	for (var i = 0; i < albumsIsSavingFavorite.length; ++i) {
		if(id == albumsIsSavingFavorite[i]) return;
	}
	albumsIsSavingFavorite.push(id);
	if(flag){
		addToLocalStorage(id, src, alt, title);
	}

	document.querySelector(".box__favorites > .favorites__item").insertAdjacentHTML("beforeEnd", 
	`<li class=item__${id} info>
  		<div class="info__photo photo">
  			<i class="photo__ico-star"></i>
  			<img class="photo__img" src="${src}" alt="${alt}" title="${title}">
  		</div>
	</li> `);

	let btn_img = document.querySelector(".box__favorites > .favorites__item > .item__"+id+" > .info__photo > .photo__img");

	btn_img.addEventListener("click", function(){
	    btnShowFullSizePhoto(btn_img.alt);
	}, false);

	let btn_ico = document.querySelector(".box__favorites > .favorites__item > .item__"+id+" > .info__photo > .photo__ico-star");
	btn_ico.style.color = "#C4AE33";

	btn_ico.addEventListener("click", function(){
		btn_ico.style.color = "#fff";
	    btnRemoveFromFavorites(id);
	}, false);
}
//удалить из раздела "избранное"
function btnRemoveFromFavorites(id)
{
	albumsIsSavingFavorite.remove(id);
	let elem = document.querySelector(".box__favorites > .favorites__item > .item__"+id);
	elem.parentNode.removeChild(elem);

	removeFromLocalStorage(id);
}
//Скрытие модальной формы
function btnModal()
{
	document.querySelector(".box__modal").style.display = "none";
}
//============================

//Добавление к стандартному массиву функции remove по значению
Array.prototype.remove = function() 
{
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};


//======================================

//функция асинхронной загрузки 
function jsonLoader(file)
{
	let Connect = new XMLHttpRequest();

	Connect.open("GET", file, true);

	Connect.onreadystatechange = function ()
    {
        if(Connect.readyState === 4)
        {
            if(Connect.status === 200 || Connect.status == 0)
            {
				
            	if(usersList == null)
            	{
            		usersList = JSON.parse(Connect.responseText);
            		jsonLoader("https://json.medrating.org/albums");
            	}
            	else if(albumsList == null)
            	{
            		albumsList = JSON.parse(Connect.responseText);
            		jsonLoader("https://json.medrating.org/photos");
            	}
            	else if(photosList  == null)
            	{
            		photosList = JSON.parse(Connect.responseText);

            		contentFilling(usersList, albumsList, photosList)
            	}
            }
        }
    }

    Connect.send(null);
}
//функция наполнения контентом
function contentFilling(users, albums, photos)
{

	for(let usrId = 0; usrId < users.length; ++usrId)
	{
		if(users[usrId].name != undefined)
		{
			element_content.insertAdjacentHTML("beforeEnd", 
			`<div class = "content__user user_${users[usrId].id}">
				<ul class="user__info">
					<li class="user__name"><span class="caret">${users[usrId].name}</span>
						<ul class="nested">						  
						
						</ul>
					</li>
				</ul>
			</div>`);

			//console.log(document.querySelector(".user_"+users[usrId].id+" .main_ul li > .nested"));
			element_content_albums =  document.querySelector(".user_"+users[usrId].id+" .user__info li > .nested");

			for(let albId = 0; albId < albums.length; ++albId)
			{
				if(users[usrId].id == albums[albId].userId)
				{
					element_content_albums.insertAdjacentHTML("beforeEnd", 
					`<li onclick="albumSelect(${users[usrId].id},${albums[albId].id})" class = "user__album album_${albums[albId].id}"><span class="caret" >${albums[albId].title}</span>
					    <ul class="nested">
					      	 
						</ul>
				  	</li>`);
			  		
				}
			}
		}
		
	}


	let toggler_ul = document.getElementsByClassName("caret");

	for (let i = 0; i < toggler_ul.length; i++) {
		toggler_ul[i].addEventListener("click", function() {
			this.parentElement.querySelector(".nested").classList.toggle("active");
			this.classList.toggle("caret-down");
		});
	}

	readFromLocalStorage();
}
//функция выборки альбомов соответствующим пользователям
function albumSelect(usrId, albId)
{	
	for (var i = 0; i < albomsIsLoaded.length; ++i) {
		if(albId == albomsIsLoaded[i]) return;
	}
	albomsIsLoaded.push(albId);

	var element_content_album_photos = document.querySelector(".user_"+usersList[usrId-1].id+" .user__info li > .nested > .album_"+albumsList[albId-1].id+" > ul");
	for(let phsId = 0; phsId < photosList.length; ++phsId)
	{
		if(albumsList[albId-1].id == photosList[phsId].albumId)
		{
			element_content_album_photos.insertAdjacentHTML("beforeEnd", 
			`<li class = "photo_${photosList[phsId].id}">
	      		<div class="album__photo photo">
	      			<i class="photo__ico-star"></i>
	      			<img class="photo__img" src="${photosList[phsId].thumbnailUrl}" alt="${photosList[phsId].url}"  title="${photosList[phsId].title}">
	      		</div>
			</li>`);

			let btn_img = document.querySelector(".user_"+usersList[usrId-1].id+" .user__info li > .nested > .album_"+albumsList[albId-1].id + " .photo_"+photosList[phsId].id +" .photo > .photo__img");
			
			btn_img.addEventListener("click", function(){
			    btnShowFullSizePhoto(btn_img.alt);
			}, false);

			let btn_ico = document.querySelector(".user_"+usersList[usrId-1].id+" .user__info li > .nested > .album_"+albumsList[albId-1].id + " .photo_"+photosList[phsId].id +" .photo > .photo__ico-star");

			btn_ico.addEventListener("click", function(){
			    btnAddToFavorites(photosList[phsId].id, btn_img.src, btn_img.alt, btn_img.title);
			}, false);
		}
	}
}

jsonLoader("https://json.medrating.org/users/");