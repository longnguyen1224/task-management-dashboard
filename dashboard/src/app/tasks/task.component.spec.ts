import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';


import { TasksComponent } from './tasks.component';
import { TasksService } from './tasks.service';


 //Mock Service
 
class TasksServiceMock {
  updateTask = vi.fn().mockReturnValue(of({}));

  getTasks() {
    return of([
      {
        id: '1',
        title: 'Task A',
        description: 'Desc A',
        category: 'Work',
        status: 'Todo',
        order: 0,
      },
      {
        id: '2',
        title: 'Task B',
        description: 'Desc B',
        category: 'Work',
        status: 'Todo',
        order: 1,
      },
    ]);
  }
}

describe('TasksComponent', () => {
  let fixture: ComponentFixture<TasksComponent>;
  let component: TasksComponent;
  let service: TasksServiceMock;


  //Test Setup

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TasksComponent, // standalone component
        
      ],
      providers: [{ provide: TasksService, useClass: TasksServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(TasksService) as unknown as TasksServiceMock;

    fixture.detectChanges(); // triggers ngOnInit()
  });

   //Basic Creation
 
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

   //Data Loading
   
  it('loads tasks and distributes them by status', () => {
    expect(component.tasksByStatus.Todo.length).toBe(2);
  });


    //Filtering
   
  it('filters tasks by category', () => {
    component.setCategory('Work');
    expect(component.visibleTasks.every(t => t.category === 'Work')).toBe(true);
  });

  it('filters tasks by search term', () => {
    component.activeCategory = 'All';
    component.activeFilter = 'All';
    component.activeSort = null;

    component.tasks = [
      {
        id: '1',
        title: 'Task A',
        description: 'Desc A',
        category: 'Work',
        status: 'Todo',
        order: 0,
      },
      {
        id: '2',
        title: 'Task B',
        description: 'Desc B',
        category: 'Personal',
        status: 'Done',
        order: 0,
      },
    ] as any;

    component.tasksByStatus = {
      Todo: [],
      InProgress: [],
      Review: [],
      Done: [],
    };

    component.tasks.forEach(task => {
      component.tasksByStatus[task.status].push(task);
    });

    component.searchTerm = 'Task A';
    component.applyFiltersAndSort();

    const results = component.getTasksByStatus('Todo');

    expect(results.length).toBe(1);
    expect(results[0].title).toBe('Task A');
  });

  
   //Permissions
  it('allows edit/delete for OWNER role', () => {
    component.userRole = 'OWNER';
    fixture.detectChanges();

    expect(component.canEdit).toBe(true);
  });

  it('hides edit/delete for USER role', () => {
    component.userRole = 'USER';
    fixture.detectChanges();

    expect(component.canEdit).toBe(false);
  });

   //Drag & Drop

  it('reorders tasks within the same column', () => {
    const todo = component.tasksByStatus.Todo;

    const event: any = {
      previousIndex: 0,
      currentIndex: 1,
      previousContainer: { data: todo },
      container: { data: todo },
    };

    component.dropInColumn(event, 'Todo');

    expect(component.tasksByStatus.Todo[0].id).toBe('2');
    expect(component.tasksByStatus.Todo[1].id).toBe('1');
    expect(service.updateTask).toHaveBeenCalled();
  });

  it('moves task to another column and updates status', () => {
    const todo = component.tasksByStatus.Todo;
    const done = component.tasksByStatus.Done;

    const event: any = {
      previousIndex: 0,
      currentIndex: 0,
      previousContainer: { data: todo },
      container: { data: done },
    };

    component.dropInColumn(event, 'Done');

    const movedTask = component.tasksByStatus.Done[0];

    expect(movedTask.status).toBe('Done');
    expect(service.updateTask).toHaveBeenCalledWith(
      movedTask.id,
      expect.objectContaining({ status: 'Done' })
    );
  });
});
