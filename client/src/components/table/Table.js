import React from 'react';
import MaterialTable from 'material-table';
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Icon,
  Tooltip
} from '@material-ui/core';

/**
 * Parameters
 * 
 * tableData: The data which is given to table to show
 * setBodyHeight: Defines max body heigh which is 600px by default
 */
const Table = (props) => {
  return (
    <div className="table">
      <MaterialTable
        columns={[ // TODO: Add translations
          {
            title: 'Preview Image',
            field: 'image',
            render: rowData => rowData.image ?
              <img src={rowData.image} className="table__column__icon" /> :
              <Icon className="table__column__icon">crop_original</Icon>
          },
          { title: 'Title', field: 'title' },
          { title: 'Material', field: 'material' },
          { title: 'Type', field: 'type' },
          { title: 'Period', field: 'period' },
          { title: 'Town', field: 'municipality' },
        ]}
        data={props.tableData}
        title="Finds"
        detailPanel={rowData => {
          return renderDetailPanel(rowData);
        }}
        options={{
          pageSize: 10,
          pageSizeOptions: [10, 50, 100, 1000],
          search: false,
          showTitle: false,
          maxBodyHeight: props.setBodyHeight && 600,
        }}
        onRowClick={(event, rowData, togglePanel) => togglePanel()}
      />
    </div>
  );
};

const renderDetailPanel = (row) => {
  return (
    <Card className="table__detail-panel">
      <CardActionArea className="table__detail-panel__container">
        {
          row.image ? (
            <CardMedia
              className="table__detail-panel__container__image"
              image={row.image}
              title={row.title}
            />
          ) : (
            <Tooltip title="No Image" placement="top">
              <Icon className="table__detail-panel__container__icon">crop_original</Icon>
            </Tooltip>
          )
        }
        <CardContent className="table__detail-panel__container__content">
          <Typography gutterBottom variant="subtitle1">
            Province: {row.province}
          </Typography>
          <Typography gutterBottom variant="subtitle1">
            Specification: {row.specification}
          </Typography>
          <Typography component="p">
            {row.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default Table;
