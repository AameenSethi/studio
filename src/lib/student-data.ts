export type Student = {
    id: string;
    name: string;
    class: string;
    avatarUrl: string;
};

export const studentData: Student[] = [
    {
        id: 'user-123',
        name: 'Alex Johnson',
        class: '10th Grade',
        avatarUrl: 'https://i.pravatar.cc/150?u=user-123',
    },
    {
        id: 'user-456',
        name: 'Maria Garcia',
        class: '11th Grade',
        avatarUrl: 'https://i.pravatar.cc/150?u=user-456',
    },
    {
        id: 'user-789',
        name: 'Chen Wei',
        class: '9th Grade',
        avatarUrl: 'https://i.pravatar.cc/150?u=user-789',
    },
    {
        id: 'user-101',
        name: 'Fatima Al-Fassi',
        class: '12th Grade',
        avatarUrl: 'https://i.pravatar.cc/150?u=user-101',
    },
];

export const getStudentById = (id: string): Student | undefined => {
    return studentData.find(student => student.id === id);
}
