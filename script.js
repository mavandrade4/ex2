const JSON_PATH = 'books.json';

//////////////////

//////// SORT FUNC

const SORT_YEAR_DESC = function(a, b) {
  return new Date(b.publication_date) - new Date (a.publication_date);
};
const SORT_RATING_DESC = function(a, b) {
  return parseFloat(b.average_rating) - parseFloat(a.average_rating);
};

const SORT_ALPHA_PUBLISHER = function(a, b) {
  const publisherA = (a.publisher || '').toUpperCase();
  const publisherB = (b.publisher || '').toUpperCase();
  return publisherA.localeCompare(publisherB);
};
const SORT_ALPHA_AUTHOR = function(a, b) {
  const titleA = a.authors.toUpperCase();
  const titleB = b.authors.toUpperCase();
  if (titleA < titleB) { return -1; }
  if (titleA > titleB) { return 1; }
  return 0;
};
const SORT_ALPHA_TITLE = function(a, b) {
  const titleA = a.title.toUpperCase();
  const titleB = b.title.toUpperCase();
  if (titleA < titleB) { return -1; }
  if (titleA > titleB) { return 1; }
  return 0;
};

//////////////////

class App {
  constructor() {
    this._onJsonReady = this._onJsonReady.bind(this);
    this._sortBooks = this._sortBooks.bind(this);
    
    this.headerClickHandlers = {
      'alpha': SORT_ALPHA_TITLE,
      'author': SORT_ALPHA_AUTHOR,
      'year': SORT_YEAR_DESC,
      'rating': SORT_RATING_DESC,
      'publisher': SORT_ALPHA_PUBLISHER,
    };

    this.initializeHeaderClickHandlers();
  }

  handleWindowResize() {
    this.adjustTableSize();
  }

  adjustTableSize() {
    const table = document.querySelector('#myTable');
    const windowWidth = window.innerWidth;

    table.style.width = (windowWidth - 20) + 'px';
  }
  
  initializeHeaderClickHandlers() {
    const headers = document.querySelectorAll('#myTable th');
    headers.forEach(header => {
      const headerId = header.getAttribute('id');
      header.addEventListener('click', () => this.handleHeaderClick(headerId));
    });

    ////// SEARCH
    // TEXT
    const searchInput = document.querySelector('#searchInput');
    searchInput.addEventListener('input', () => this.handleSearchInput());
    // DATE
    const dateFilter = document.querySelector('#dateFilter');
    dateFilter.addEventListener('input', () => this._renderBooks());
    // RATING
    const minRatingInput = document.querySelector('#minRating');
    minRatingInput.addEventListener('input', () => this._renderBooks());

    const maxRatingInput = document.querySelector('#maxRating');
    maxRatingInput.addEventListener('input', () => this._renderBooks());
  }

  handleHeaderClick(headerId) {
    const sortFunction = this.headerClickHandlers[headerId];
    if (sortFunction) {
      this._sortBooks(sortFunction);
    }
  }

  handleSearchInput() {
    this._renderBooks();
  }
  
  _sortBooks(sortFunction) {
    this.bookInfo.sort(sortFunction);
    this._renderBooks();
  }

  _renderBooks() {
    const table = document.querySelector('#myTable');
    const searchInput = document.querySelector('#searchInput');
    //TEXT
    const searchTerm = searchInput.value.trim().toUpperCase();
    //DATE
    const selectedDate = dateFilter.value;
    /*/RATING
    const minRating = parseFloat(minRatingInput.value) || 0;
    const maxRating = parseFloat(maxRatingInput.value) || 6;
    */

    // Clear existing rows
    table.querySelectorAll('tr:not(.header)').forEach(row => row.remove());

    for (const info of this.bookInfo) {
      if (
        info.title.toUpperCase().includes(searchTerm) ||
        info.authors.toUpperCase().includes(searchTerm) ||
        info.publisher.toUpperCase().includes(searchTerm) ||
         (!selectedDate || new Date(info.publication_date) >= new Date(selectedDate)) || 
         (info.average_rating >= minRating && info.average_rating <= maxRating)
      ) {
        const row = table.insertRow(-1);

        const cell1 = row.insertCell(0);
        cell1.innerHTML = info.title;

        const cell2 = row.insertCell(1);
        cell2.innerHTML = info.authors;

        const cell3 = row.insertCell(2);
        cell3.innerHTML = info.publication_date;

        const cell4 = row.insertCell(3);
        cell4.innerHTML = info.average_rating;

        const cell5 = row.insertCell(4);
        cell5.innerHTML = info.publisher;
      }
    }
  }

  loadBooks() {
    fetch(JSON_PATH)
        .then(this._onResponse)
        .then(this._onJsonReady);
  }

  _onJsonReady(json) {
    if (Array.isArray(json.books)) {
      this.bookInfo = json.books;
      this._renderBooks();
    } else {
      console.error('Invalid book data:', json.books);
    }
  }

  _onResponse(response) {
    return response.json();
  }
}

class Book {
  constructor(bookContainer, title) {
    this.element = document.createElement('span');
    this.element.innerText = title;
    bookContainer.append(this.element);
  }
}

// script.js
document.addEventListener('DOMContentLoaded', function () {
  const app = new App();
  app.loadBooks();
});

