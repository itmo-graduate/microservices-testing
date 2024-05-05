import React, {useState, useEffect} from 'react';
import {Box, IconButton, Button, CircularProgress, Typography} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {Service} from '../types/service';
import {Logs} from '../components/Logs';
import {LogEntry} from '../types/logs';
import { SERVER_HOST as initialServerHost } from '../const';

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean[]>([]);
  const [reportURL, setReportURL] = useState<string[]>([]);
  const [serviceLogs, setServiceLogs] = useState<Map<string, LogEntry[]>>(new Map());
  const [_, setTestResults] = useState<any>([]);

  const SERVER_HOST = localStorage.getItem('serverHost') || initialServerHost;

  const updateLogs = (serviceId: string, newLog: LogEntry) => {
    console.log('updateLogs', newLog);
    setServiceLogs(prevLogs => {
      const updatedLogs = new Map(prevLogs);
      const logsForService = updatedLogs.get(serviceId) || [];
      const newLogsForService = [...logsForService, newLog];
      updatedLogs.set(serviceId, newLogsForService);
      localStorage.setItem('serviceLogs', JSON.stringify(Array.from(updatedLogs.entries())));
      return updatedLogs;
    });
  };

  const clearServiceLogs = (serviceId: string) => {
    setServiceLogs(prevLogs => {
        const updatedLogs = new Map(prevLogs);
        updatedLogs.set(serviceId, []);
        localStorage.setItem('serviceLogs', JSON.stringify(Array.from(updatedLogs.entries())));
        return updatedLogs;
    });
  };

  useEffect(() => {
    const savedLogs = localStorage.getItem('serviceLogs');
    if (savedLogs) {
      const parsedLogs = new Map<string, LogEntry[]>(JSON.parse(savedLogs));
      setServiceLogs(parsedLogs);
    } else {
      setServiceLogs(new Map());
    }
  }, []);

  useEffect(() => {
    const storedServices = JSON.parse(localStorage.getItem('services') || '[]');
    setServices(storedServices);
    setIsLoading(Array(storedServices.length).fill(false));
    setReportURL(Array(storedServices.length).fill(null));
  }, []);

  const removeService = (serviceIndex: number) => {
    const updatedServices = [...services];
    updatedServices.splice(serviceIndex, 1);
    localStorage.setItem('services', JSON.stringify(updatedServices));
    setServices(updatedServices);
    setIsLoading(isLoading.filter((_, index) => index !== serviceIndex));
  };

  const removeRoute = (serviceIndex: number, routeIndex: number) => {
    const updatedServices = [...services];
    updatedServices[serviceIndex].routes.splice(routeIndex, 1);
    localStorage.setItem('services', JSON.stringify(updatedServices));
    setServices(updatedServices);
  };

  const runTest = async (serviceIndex: number, service: Service) => {
    setIsLoading(isLoading => isLoading.map((value, index) => index === serviceIndex ? true : value));

    console.log('Starting runTest block...');
    console.log('service', service);

    const initMicroserviceResponse = await fetch(`${SERVER_HOST}/init/microservice/${serviceIndex}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({service}),
    });

    console.log('initMicroservice OK:', initMicroserviceResponse.ok);

    const eventSource = new EventSource(`${SERVER_HOST}/run/microservice/${serviceIndex}`, {withCredentials: false});

    eventSource.onmessage = (event) => {
      // console.log('NEW MESSAGE', event.data);
      const data = JSON.parse(event.data);
      if (data.reportURL) {
        // setIsLoading(isLoading => isLoading.map((value, index) => index === serviceIndex ? true : value));
        const finalURL = SERVER_HOST + data.reportURL;
        setReportURL(reportURL => reportURL.map((value, index) => index === serviceIndex ? finalURL : value));
        // localStorage.setItem('reportURL', JSON.stringify(Array.from(reportURL.entries())));


        return;
      }
        setTestResults((currentResults: any) => [...currentResults, data]);
        updateLogs(String(serviceIndex), data);

      // Обработка полученных данных, например, обновление состояния компонента
      // eventSource.close();
      // setIsLoading(isLoading => isLoading.map((value, index) => index === serviceIndex ? false : value));
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
      setIsLoading(isLoading => isLoading.map((value, index) => index === serviceIndex ? false : value));
    };

  };

  const viewReport = (reportURL: string) => {
    window.open(reportURL);
  };

  return (
    <div>
      <Typography sx={{mt: 2}} variant={'h5'}>Services</Typography>
      {services.map((service, serviceIndex) => (
        <div key={serviceIndex} style={{borderBottom: '1px solid #ddd', marginBottom: '4px', paddingBottom: '10px'}}>
          <h2>#{serviceIndex} {service.name}</h2>
          <p>Service Host: {service.host}</p>
          <p>Duration: {service.duration}</p>
          <p>Start VU arrivalRate: {service.usersStart}</p>
          <p>End VU arrivalRate: {service.usersEnd}</p>
          {service.routes.map((route, routeIndex) => (
            <Box key={routeIndex}
                 sx={{border: '1px solid #ddd', p: 2, mb: 2, borderRadius: '4px', position: 'relative'}}>
              <p>Path: {route.path}</p>
              <p>Method: {route.method}</p>
              {route.bodyFields && <p>Body Fields: {route.bodyFields}</p>}
              <IconButton onClick={() => removeRoute(serviceIndex, routeIndex)} color="secondary"
                          sx={{position: 'absolute', top: '20px', right: '20px'}}>
                <CloseIcon/>
              </IconButton>
            </Box>
          ))}
          {<Logs sx={{mt: 3, mb: 3}} data={serviceLogs.get(String(serviceIndex)) || []}/>}
          <Button onClick={() => removeService(serviceIndex)} disabled={isLoading[serviceIndex]}>
            Delete Service
          </Button>
          <Button onClick={() => clearServiceLogs(String(serviceIndex))} disabled={isLoading[serviceIndex]}>
            Clear Logs
          </Button>
          <Button onClick={() => runTest(serviceIndex, service)} disabled={isLoading[serviceIndex]}>
            {isLoading[serviceIndex] ? <CircularProgress size={20}/> : 'Run Test'}
          </Button>
          {reportURL[serviceIndex] && (
            <Button onClick={() => viewReport(reportURL[serviceIndex])}>
              View Report
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ServicesPage;