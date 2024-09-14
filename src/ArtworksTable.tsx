import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { Paginator } from 'primereact/paginator';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { ChevronDownIcon } from '@chakra-ui/icons';
import axios from 'axios';
import './ArtworksTable.css'; 

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const ArtworksTable: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false); 
  const [customRowCount, setCustomRowCount] = useState<number | null>(null); 
  const overlayPanelRef = useRef<OverlayPanel>(null);

  useEffect(() => {
    fetchArtworks(page);
  }, [page]);

  const fetchArtworks = async (page: number) => {
    setLoading(true);
    const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}`);
    const fetchedData = response.data.data.map((item: any) => ({
      id: item.id,
      title: item.title,
      place_of_origin: item.place_of_origin,
      artist_display: item.artist_display,
      inscriptions: item.inscriptions,
      date_start: item.date_start,
      date_end: item.date_end,
    }));
    setArtworks(fetchedData);
    setTotalRecords(response.data.pagination.total);
    setLoading(false);
  };

  const onPageChange = (e: any) => {
    setPage(e.page + 1); 
  };

  
  const isAllSelectedForPage = () => {
    return (
      artworks.length > 0 &&
      artworks.every((artwork) => selectedArtworks.some((item) => item.id === artwork.id))
    );
  };

  const rowSelectionTemplate = (rowData: Artwork) => (
    <Checkbox
      onChange={() => {
        setSelectedArtworks((prev) =>
          prev.some((item) => item.id === rowData.id)
            ? prev.filter((item) => item.id !== rowData.id)
            : [...prev, rowData]
        );
      }}
      checked={selectedArtworks.some((item) => item.id === rowData.id)}
    />
  );

  const selectCustomRows = async () => {
    if (customRowCount && customRowCount > 0) {
      let rowsNeeded = customRowCount - selectedArtworks.length;
  
     
      let newSelectedArtworks = [...selectedArtworks];
      for (let i = 0; i < artworks.length && rowsNeeded > 0; i++) {
        const artwork = artworks[i];
        if (!newSelectedArtworks.some((item) => item.id === artwork.id)) {
          newSelectedArtworks.push(artwork);
          rowsNeeded--;
        }
      }
  
     
      setSelectedArtworks(newSelectedArtworks);
  
      if (rowsNeeded > 0) {
        await fetchAndSelectRows(page + 1, rowsNeeded, newSelectedArtworks);
      }
  
      overlayPanelRef.current?.hide(); 
    }
  };

  const fetchAndSelectRows = async (startingPage: number, rowsNeeded: number, currentSelectedArtworks: Artwork[]) => {
    let newSelectedArtworks = [...currentSelectedArtworks]; 
    let pageToFetch = startingPage;
  
    while (rowsNeeded > 0 && pageToFetch <= Math.ceil(totalRecords / 10)) {
      const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${pageToFetch}`);
      const fetchedArtworks = response.data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        place_of_origin: item.place_of_origin,
        artist_display: item.artist_display,
        inscriptions: item.inscriptions,
        date_start: item.date_start,
        date_end: item.date_end,
      }));
  
      for (let i = 0; i < fetchedArtworks.length && rowsNeeded > 0; i++) {
        const artwork = fetchedArtworks[i];
        if (!newSelectedArtworks.some((item) => item.id === artwork.id)) {
          newSelectedArtworks.push(artwork);
          rowsNeeded--;
        }
      }
  
    
      setSelectedArtworks([...newSelectedArtworks]);
  
      pageToFetch++;
    }
  };

  const handleSelectAllChange = (e: any) => {
    if (e.checked) {
      
      setSelectedArtworks((prevSelected) => [
        ...prevSelected,
        ...artworks.filter((artwork) => !prevSelected.some((item) => item.id === artwork.id)),
      ]);
    } else {
      
      setSelectedArtworks((prevSelected) =>
        prevSelected.filter((item) => !artworks.some((artwork) => artwork.id === item.id))
      );
    }
  };

  return (
    <div className="artworks-table-container">
      <DataTable
        value={artworks}
        paginator={false}
        loading={loading} 
        className="artworks-table"
      >
       
        <Column
          header={
            <div className="header-actions">
              <Checkbox
                onChange={handleSelectAllChange}
                checked={isAllSelectedForPage()} 
              />
              <Button
                icon={<ChevronDownIcon />}
                onClick={(e) => overlayPanelRef.current?.toggle(e)}
                className="p-button-text p-button-plain"
              />
              <OverlayPanel ref={overlayPanelRef}>
                <div className="overlay-content">
                  <h5>Enter number of rows...</h5>
                  <InputNumber
                    value={customRowCount ?? 0}
                    onValueChange={(e) => setCustomRowCount(e.value ?? 0)}
                    placeholder="Enter number of rows"
                    className="p-inputtext-sm"
                    style={{ width: '100%' }}
                  />
                  <Button
                    label="Select"
                    onClick={selectCustomRows}
                    className="p-mt-2"
                    style={{ width: '100%' }}
                  />
                </div>
              </OverlayPanel>
            </div>
          }
        />

        <Column body={rowSelectionTemplate} />
        <Column field="title" header="Title" />
        <Column field="artist_display" header="Artist" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
        <Column field="inscriptions" header="Inscriptions" />
      </DataTable>

      <Paginator
        first={(page - 1) * 10}
        rows={10}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default ArtworksTable;
