let buku = [];
const renderEvent = 'render-rak';
const saveEvent = 'save-rak';
const storageRak = 'RAK';

document.addEventListener('DOMContentLoaded', function() {
    const submitData = document.getElementById('form');
    const formPencarian = document.getElementById('formCari')
    const perpustakaan = document.getElementById('perpustakaan');
    const tombolPerpus = document.getElementById('tutupPerpustakaan');

    location.href = '#form';

    submitData.addEventListener('submit', function(event) {
        perpustakaan.style.visibility = 'visible';
        tombolPerpus.style.visibility = 'visible';
        location.href= '#perpustakaan';
        event.preventDefault();
        addToRak();
    });

    formPencarian.addEventListener('submit', function (event) {
        event.preventDefault();
        pencarianBuku();
     });
    

    const tombolMenu = document.getElementById('tombolDaftarBuku');
    tombolMenu.addEventListener('click', function() {
        if (perpustakaan.style.visibility === 'hidden') {
            perpustakaan.style.visibility = 'visible';
            tombolPerpus.style.visibility = 'visible';
        } else {
            perpustakaan.style.visibility = 'visible';
            tombolPerpus.style.visibility = 'visible';
        }
            
    });

    const tombolTutup = document.getElementById('tutupPerpustakaan');
    tombolTutup.addEventListener('click', function() {
        tombolTutup.style.visibility = 'hidden';
        perpustakaan.style.visibility = 'hidden';
        
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(renderEvent, function() {
    const unCompletedRead = document.getElementById('unread');
    unCompletedRead.innerHTML = '';

    const completedRead = document.getElementById('read');
    completedRead.innerHTML = '';

    for(const bukuItem of buku) {
        const bukuElement = buatRak(bukuItem);
        if (!bukuItem.isComplete) {
            unCompletedRead.append(bukuElement);
        } else {
            completedRead.append(bukuElement);
        }
    }
});


function generateId() {
    return +new Date();
}

function generateBukuIsi(id, judul, penulis, terbitan, isComplete) {
    return {
        id,
        judul,
        penulis,
        terbitan,
        isComplete
    }
}


function addToRak() {
    const inputJudul = document.getElementById('inputJudul').value;
    const inputPenulis = document.getElementById('inputPenulis').value;
    const inputTerbit = document.getElementById('inputTerbit').value;
    const tombolSelesaiDiBaca = document.getElementById('tombolSelesaiDiBaca').checked;

    const pasangID = generateId();
    const bukuIsi = generateBukuIsi(pasangID, inputJudul, inputPenulis, inputTerbit, tombolSelesaiDiBaca);
    buku.push(bukuIsi);

    document.dispatchEvent(new Event(renderEvent));
    saveData();
}

function buatRak(bukuIsi) {
    const judulBuku = document.createElement('h3');
    judulBuku.innerText = bukuIsi.judul;

    const penulisBuku = document.createElement('p');
    penulisBuku.innerHTML ='<span>' + bukuIsi.penulis +'</span>'  + ', ' + bukuIsi.terbitan;
    
    const rakContainer = document.createElement('div');
    rakContainer.classList.add('buku');
    rakContainer.append(judulBuku, penulisBuku);

    const container = document.createElement('div');
    container.classList.add('itemBuku');
    container.append(rakContainer);
    container.setAttribute('id', 'buku-${bukuIsi.id}');

    if (bukuIsi.isComplete) {
        const tombolUlangi = document.createElement('button');
        tombolUlangi.classList.add('tombolUlangi');
        tombolUlangi.addEventListener('click', function () {
            ulangiBacaBuku(bukuIsi.id);
        });

        const tombolHapus = document.createElement('button');
        tombolHapus.classList.add('tombolHapus');
        tombolHapus.addEventListener('click', function() {
            const tanya = confirm('Anda ingin menghapus buku ini?');

            if (tanya === true) {
                pesan = 'Ya';
                hapusBuku(bukuIsi.id);
            } else {
                pesan = 'Tidak';
            }
            
        });

        container.append(tombolUlangi, tombolHapus);
    } else {
        const tombolSelesai = document.createElement('button');
        tombolSelesai.classList.add('tombolSelesai');
        tombolSelesai.addEventListener('click', function() {
            selesaiBacaBuku(bukuIsi.id);
        });

        const tombolHapus = document.createElement('button');
        tombolHapus.classList.add('tombolHapus');
        tombolHapus.addEventListener('click', function() {
            hapusBuku(bukuIsi.id);
        });

        container.append(tombolSelesai, tombolHapus);
    }

    return container
}

function ulangiBacaBuku(bukuId) {
    const targetBuku = cariBuku(bukuId);

    if (targetBuku == null) return;
    targetBuku.isComplete = false;

    document.dispatchEvent(new Event(renderEvent));
    saveEvent();
}

function hapusBuku(bukuId) {
    const targetBuku = cariIndexBuku(bukuId);
        
    if (targetBuku === -1) return;
    buku.splice(targetBuku, 1);

    document.dispatchEvent(new Event(renderEvent));
    saveData();
}

function selesaiBacaBuku(bukuId) {
    const targetBuku = cariBuku(bukuId);

    if (targetBuku === null) return;
    targetBuku.isComplete = true;

    document.dispatchEvent(new Event(renderEvent));
    saveBuku();
}

function cariBuku(bukuId) {
    for (const bukuItem of buku) {
        if (bukuItem.id === bukuId) {
            return bukuItem;
        }
    }

    return null;
}

function cariIndexBuku(bukuId) {
    for (const index in buku) {
        if (buku[index].id === bukuId) {
            return index;
        }
    }

    return -1;
}

function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(buku);
      localStorage.setItem(storageRak, parsed);
      document.dispatchEvent(new Event(saveEvent));
    }
}

function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert('Browser anda tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(storageRak);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const judul of data) {
            buku.push(judul);
        }
    }
    
    document.dispatchEvent(new Event(renderEvent));
}

function pencarianBuku() {
    const cari = document.getElementById('cariBuku').value.toLowerCase();
    const serializedData = localStorage.getItem(storageRak);
    const data = JSON.parse(serializedData);
    const searchedBooks = data.filter(function (book) {
      return book.judul.toLowerCase().includes(cari);
    });
    if (searchedBooks.length === 0) {
      alert('Buku tidak ditemukan!');
      return location.reload();
    }
    if (cari !== '') {
      buku = [];
      for (const book of searchedBooks) {
        buku.push(book);
      }
      document.dispatchEvent(new Event(renderEvent));
    } else {
      buku = [];
      loadDataFromStorage();
    }
  }

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
        document.getElementById('header').style.background = 'rgba(22, 18, 41, 0.98)';
    } else {
        document.getElementById('header').style.background =  'rgba(0, 0, 0, 0)';
    }
}