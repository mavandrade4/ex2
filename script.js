const JSON_PATH = 'books1.json';

//////// SORT FUNC

const SORT_YEAR_DESC = function(a, b) {
  return new Date(b.publication_date) - new Date (a.publication_date);
};
const SORT_RATING_DESC = function(a, b) {
  return parseFloat(b.average_rating) - parseFloat(a.average_rating);
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

////////////////// APP

class App {
  constructor() {
    this._onJsonReady = this._onJsonReady.bind(this);
    this._sortBooks = this._sortBooks.bind(this);

    // SORT

    this.headerClickHandlers = {
      'alpha': SORT_ALPHA_TITLE,
      'author': SORT_ALPHA_AUTHOR,
      'year': SORT_YEAR_DESC,
      'rating': SORT_RATING_DESC,
    };

    // SEARCH INPUT

    this.minRatingInput = document.querySelector('#minRating');
    this.minRatingInput.addEventListener('input', () => this._renderBooks());
    this.maxRatingInput = document.querySelector('#maxRating');
    this.maxRatingInput.addEventListener('input', () => this._renderBooks());
    
    // RESIZE

    this.handleWindowResize = this.handleWindowResize.bind(this);
    window.addEventListener('resize', this.handleWindowResize);
    
    this.initializeHeaderClickHandlers();
  }

  // RESIZE
  handleWindowResize() {
    this.adjustTableSize();
  }
  adjustTableSize() {
    const table = document.querySelector('#myTable');
    const windowWidth = window.innerWidth;
    table.style.width = (windowWidth - 20) + 'px';
  }
  
  // SORT
  initializeHeaderClickHandlers() {
    const headers = document.querySelectorAll('#myTable th');
    headers.forEach(header => {
      const headerId = header.getAttribute('id');
      header.addEventListener('click', () => this.handleHeaderClick(headerId));
    });

    /// SEARCH
    // TEXT
    const searchInput = document.querySelector('#searchInput');
    searchInput.addEventListener('input', () => this.handleSearchInput());
    // DATE
    this.dateFilter = document.querySelector('#dateFilter');
    this.dateFilter.addEventListener('input', () => this._renderBooks());
    // RATING
    const minRatingInput = document.querySelector('#minRating');
    minRatingInput.addEventListener('input', () => this._renderBooks());
    const maxRatingInput = document.querySelector('#maxRating');
    maxRatingInput.addEventListener('input', () => this._renderBooks());
  }

  // SORT
  handleHeaderClick(headerId) {
    const sortFunction = this.headerClickHandlers[headerId];
    if (sortFunction) {
      this._sortBooks(sortFunction);
    }
  }
  _sortBooks(sortFunction) {
    this.bookInfo.sort(sortFunction);
    this._renderBooks();
  }

  // SEARCH
  handleSearchInput() {
    this._renderBooks();
  }

  // LOAD
  loadBooks() {
    fetch(JSON_PATH)
        .then(this._onResponse)
        .then(this._onJsonReady);
  }
  _onJsonReady(json) {
    console.log('Books loaded:', json);
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

  // RENDER BOOKS
  _renderBooks() {
    const table = document.querySelector('#myTable');
    const searchInput = document.querySelector('#searchInput');
    // TEXT
    const searchTerm = searchInput.value.trim().toUpperCase();
    // DATE
    const selectedDate = this.dateFilter.value;
    // RATING
    const minRating = parseFloat(this.minRatingInput.value) || 0;
    const maxRating = parseFloat(this.maxRatingInput.value) || 6;
  
    // Clear existing rows
    table.querySelectorAll('tr:not(.header)').forEach(row => row.remove());
  
    let count = 0;
  
    this.bookInfo.forEach(info => {
      const titleMatches = info.title.toUpperCase().includes(searchTerm);
      const authorMatches = info.authors.toUpperCase().includes(searchTerm);
      const dateMatches = !selectedDate || new Date(info.publication_date) >= new Date(selectedDate);
      const ratingMatches = info.average_rating >= minRating && info.average_rating <= maxRating;
  
      if ((titleMatches || authorMatches) && dateMatches && ratingMatches) {
        const row = table.insertRow(-1);
        const cell1 = row.insertCell(0);
        cell1.innerHTML = info.title;
        const cell2 = row.insertCell(1);
        cell2.innerHTML = info.authors;
        const cell3 = row.insertCell(2);
        cell3.innerHTML = this.convertDateFormat(info.publication_date);
        const cell4 = row.insertCell(3);
        cell4.innerHTML = info.average_rating;
      }
    });
  }

  convertDateFormat(inputDate) {
    var dateComponents = inputDate.split('/');

    var month = parseInt(dateComponents[0], 10);
    var day = parseInt(dateComponents[1], 10);
    var year = parseInt(dateComponents[2], 10);

    var dateObject = new Date(year, month - 1, day);

    var convertedDay = dateObject.getDate();
    var convertedMonth = dateObject.getMonth() + 1;
    var convertedYear = dateObject.getFullYear();

    convertedDay = convertedDay < 10 ? '0' + convertedDay : convertedDay;
    convertedMonth = convertedMonth < 10 ? '0' + convertedMonth : convertedMonth;

    var resultString = convertedDay + '/' + convertedMonth + '/' + convertedYear;

    return resultString;
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

