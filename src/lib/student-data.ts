export type Student = {
    id: string;
    name: string;
    class: string;
    avatarUrl: string;
};

export const defaultStudentData: Student[] = [
    {
        id: 'alex-johnson-42',
        name: 'Alex Johnson',
        class: '10th Grade',
        avatarUrl: 'https://i.pravatar.cc/150?u=alex-johnson-42',
    },
    {
        id: 'maria-garcia-57',
        name: 'Maria Garcia',
        class: '11th Grade',
        avatarUrl: 'https://i.pravatar.cc/150?u=maria-garcia-57',
    },
    {
        id: 'chen-wei-88',
        name: 'Chen Wei',
        class: '9th Grade',
        avatarUrl: 'https://i.pravatar.cc/150?u=chen-wei-88',
    },
    {
        id: 'fatima-alfassi-31',
        name: 'Fatima Al-Fassi',
        class: '12th Grade',
        avatarUrl: 'https://i.pravatar.cc/150?u=fatima-alfassi-31',
    },
];

export const getStudentById = (id: string, students: Student[]): Student | undefined => {
    return students.find(student => student.id === id);
}
