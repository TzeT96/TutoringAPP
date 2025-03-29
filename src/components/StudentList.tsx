import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Checkbox,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface Student {
  id: string;
  name: string;
  grade: number;
  riskLevel: 'low' | 'medium' | 'high';
  emailStatus: 'sent' | 'pending' | 'failed';
  cheatingStatus: 'confirmed' | 'pending' | 'false_positive';
}

interface StudentListProps {
  students: Student[];
  onSendEmail: (studentIds: string[]) => void;
  onDownloadReport: (studentId: string) => void;
  onUpdateStatus: (studentId: string, status: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({
  students,
  onSendEmail,
  onDownloadReport,
  onUpdateStatus,
}) => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Student>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedStudents(students.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const filteredStudents = students
    .filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = filterRisk === 'all' || student.riskLevel === filterRisk;
      const matchesStatus = filterStatus === 'all' || student.cheatingStatus === filterStatus;
      return matchesSearch && matchesRisk && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === 'asc' ? 1 : -1;
      return aValue > bValue ? direction : -direction;
    });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      case 'false_positive':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <TextField
          label="Search Students"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <FormControl size="small" className="min-w-[150px]">
          <InputLabel>Risk Level</InputLabel>
          <Select
            value={filterRisk}
            label="Risk Level"
            onChange={(e) => setFilterRisk(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" className="min-w-[150px]">
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="false_positive">False Positive</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EmailIcon />}
          disabled={selectedStudents.length === 0}
          onClick={() => onSendEmail(selectedStudents)}
        >
          Send Email ({selectedStudents.length})
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedStudents.length > 0 && selectedStudents.length < students.length}
                  checked={selectedStudents.length === students.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center cursor-pointer" onClick={() => handleSort('name')}>
                  Name
                  {sortField === 'name' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center cursor-pointer" onClick={() => handleSort('grade')}>
                  Grade
                  {sortField === 'grade' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center cursor-pointer" onClick={() => handleSort('riskLevel')}>
                  Risk Level
                  {sortField === 'riskLevel' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                  )}
                </div>
              </TableCell>
              <TableCell>Email Status</TableCell>
              <TableCell>
                <div className="flex items-center cursor-pointer" onClick={() => handleSort('cheatingStatus')}>
                  Status
                  {sortField === 'cheatingStatus' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                  )}
                </div>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleSelectStudent(student.id)}
                  />
                </TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.grade}%</TableCell>
                <TableCell>
                  <span className={getRiskColor(student.riskLevel)}>
                    {student.riskLevel.charAt(0).toUpperCase() + student.riskLevel.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={getStatusColor(student.emailStatus)}>
                    {student.emailStatus.charAt(0).toUpperCase() + student.emailStatus.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={getStatusColor(student.cheatingStatus)}>
                    {student.cheatingStatus.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Tooltip title="Download Report">
                      <IconButton
                        size="small"
                        onClick={() => onDownloadReport(student.id)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Send Email">
                      <IconButton
                        size="small"
                        onClick={() => onSendEmail([student.id])}
                      >
                        <EmailIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StudentList; 