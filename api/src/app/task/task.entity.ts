import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Organization } from '../organizations/organization.entity';
import { User } from '../users/user.entity';

export type TaskCategory = 'Work' | 'Personal';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;


   //CATEGORY 
    
  @Column({ nullable: true, type: 'text' })
   category?: string;

 
   //COMPLETION STATUS
    
  @Column({ default: false })
  completed: boolean;

  
   //ORDERING (DRAG & DROP)
   
  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({
  type: 'text',
  default: 'Todo',
   })
   status: 'Todo' | 'InProgress' | 'Review' | 'Done';

  
   //ORGANIZATION RELATION
   
  @Column()
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  
   //USER RELATION
   
  @Column()
  createdById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  
   //CREATED DATE (SORTING)
   
  @CreateDateColumn()
  createdAt: Date;
}
